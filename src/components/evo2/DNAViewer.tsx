/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DNAViewerProps {
  sequence: string;
  mode: "linear" | "circular" | "3d";
  zoomLevel: number;
  highlightFeatures: boolean;
  showAnnotations: boolean;
  properties?: any;
  isDark: boolean;
}

export const DNAViewer: React.FC<DNAViewerProps> = ({
  sequence,
  mode,
  zoomLevel,
  highlightFeatures,
  showAnnotations,
  properties,
  isDark,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const threeRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [featureData, setFeatureData] = useState<any[]>([]);
  
  // Color mapping for DNA bases
  const baseColors = {
    A: isDark ? "#6366f1" : "#4f46e5", // Indigo
    T: isDark ? "#ec4899" : "#db2777", // Pink
    G: isDark ? "#10b981" : "#059669", // Emerald
    C: isDark ? "#f59e0b" : "#d97706"  // Amber
  };

  // Get color for feature type
  const getFeatureColor = (type: string) => {
    const featureColorMap: Record<string, string> = {
      "promoter": "#ef4444", // Red
      "start_codon": "#3b82f6", // Blue
      "stop_codon": "#f97316", // Orange
      "gc_rich": "#8b5cf6", // Purple
      "binding_site": "#14b8a6", // Teal
      "mutation": "#f43f5e", // Rose
      "default": "#9ca3af" // Gray
    };
    
    return featureColorMap[type] || featureColorMap.default;
  };

  // Analyze DNA sequence to identify features
  useEffect(() => {
    if (!sequence) return;
    
    // Reset loading state
    setLoading(true);
    
    // Find potential features in the DNA sequence
    const identifyFeatures = () => {
      const features = [];
      
      // Use binding sites if provided by Evo2
      if (properties?.binding_sites?.length) {
        properties.binding_sites.forEach((site: any) => {
          features.push({
            type: "binding_site",
            name: site.name,
            start: site.position,
            end: site.position + 10, // Estimate binding site length
            score: site.score
          });
        });
      }
      
      // Example: Find potential promoter regions (TATAAT or TTGACA sequences)
      let index = sequence.indexOf("TATAAT");
      while (index !== -1) {
        features.push({
          type: "promoter",
          name: "Promoter region",
          start: index,
          end: index + 6,
          score: 0.85
        });
        index = sequence.indexOf("TATAAT", index + 1);
      }
      
      // Example: Find potential start codons (ATG)
      index = sequence.indexOf("ATG");
      while (index !== -1) {
        features.push({
          type: "start_codon",
          name: "Start codon",
          start: index,
          end: index + 3,
          score: 0.95
        });
        index = sequence.indexOf("ATG", index + 1);
      }
      
      // Example: Find potential stop codons (TAA, TAG, TGA)
      ["TAA", "TAG", "TGA"].forEach(codon => {
        let stopIndex = sequence.indexOf(codon);
        while (stopIndex !== -1) {
          features.push({
            type: "stop_codon",
            name: "Stop codon",
            start: stopIndex,
            end: stopIndex + 3,
            score: 0.95
          });
          stopIndex = sequence.indexOf(codon, stopIndex + 1);
        }
      });
      
      // Example: Find GC-rich regions (potential regulatory elements)
      for (let i = 0; i < sequence.length - 10; i += 10) {
        const segment = sequence.substring(i, i + 10);
        const gcCount = (segment.match(/[GC]/g) || []).length;
        if (gcCount >= 7) {
          features.push({
            type: "gc_rich",
            name: "GC-rich region",
            start: i,
            end: i + 10,
            score: gcCount / 10
          });
        }
      }
      
      // Add some random mutations for demo if provided by Evo2
      if (properties?.mutations?.length) {
        properties.mutations.forEach((mutation: any) => {
          features.push({
            type: "mutation",
            name: `${mutation.original} → ${mutation.mutated}`,
            start: mutation.position,
            end: mutation.position + 1,
            score: mutation.effect_score
          });
        });
      }
      
      return features;
    };
    
    // Calculate features
    const features = identifyFeatures();
    setFeatureData(features);
    setLoading(false);
  }, [sequence, properties]);

  // Render the visualization based on mode
  useEffect(() => {
    if (!sequence || !containerRef.current || loading) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Clear previous visualization
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    // Create new SVG or THREE.js element based on mode
    if (mode === "linear" || mode === "circular") {
      // Create SVG element
      const svg = d3.select(containerRef.current)
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .style("background", "transparent");
      
      svgRef.current = svg.node();
      
      if (mode === "linear") {
        renderLinearDNA(svg, containerWidth, containerHeight);
      } else {
        renderCircularDNA(svg, containerWidth, containerHeight);
      }
    } else if (mode === "3d") {
      // Create THREE.js container
      const threeContainer = document.createElement('div');
      threeContainer.style.width = '100%';
      threeContainer.style.height = '100%';
      containerRef.current.appendChild(threeContainer);
      threeRef.current = threeContainer;
      
      render3DDNA(threeContainer);
    }
  }, [sequence, mode, zoomLevel, highlightFeatures, showAnnotations, loading, isDark]);

  // Render linear DNA visualization
  const renderLinearDNA = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, width: number, height: number) => {
    const padding = 50;
    const lineHeight = 30;
    const baseWidth = 15 * zoomLevel;
    const totalWidth = sequence.length * baseWidth;
    
    // Create a group for the DNA strand
    const dnaGroup = svg.append("g")
      .attr("transform", `translate(${padding}, ${height / 2})`);
    
    // Create zoomable container
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event: { transform: any; }) => {
        dnaGroup.attr("transform", event.transform);
      });
    
    svg.call(zoom);
    
    // Draw the backbone line
    dnaGroup.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", totalWidth)
      .attr("y2", 0)
      .attr("stroke", isDark ? "#6b7280" : "#9ca3af")
      .attr("stroke-width", 2);
    
    // Draw bases
    const bases = dnaGroup.selectAll(".base")
      .data(sequence.split(''))
      .enter()
      .append("g")
      .attr("class", "base")
      .attr("transform", (d: any, i: number) => `translate(${i * baseWidth}, 0)`);
    
    // Draw base rectangles
    bases.append("rect")
      .attr("x", 0)
      .attr("y", -lineHeight / 2)
      .attr("width", baseWidth)
      .attr("height", lineHeight)
      .attr("fill", (d: string | number) => (baseColors as any)[d] || "#999999")
      .attr("opacity", 0.8)
      .attr("rx", 2);
    
    // Add base text
    bases.append("text")
      .attr("x", baseWidth / 2)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("font-family", "monospace")
      .attr("font-size", 12 * zoomLevel)
      .attr("fill", "white")
      .text((d: any) => d);
    
    // Draw features if enabled
    if (highlightFeatures && featureData.length > 0) {
      // Create feature tracks above and below the sequence
      const featureGroup = dnaGroup.append("g")
        .attr("class", "features");
      
      featureData.forEach((feature, idx) => {
        const yPos = (idx % 2 === 0) ? -30 : 30;
        const width = (feature.end - feature.start) * baseWidth;
        
        // Feature highlighting
        featureGroup.append("rect")
          .attr("x", feature.start * baseWidth)
          .attr("y", yPos - 10)
          .attr("width", width)
          .attr("height", 20)
          .attr("fill", getFeatureColor(feature.type))
          .attr("opacity", 0.7)
          .attr("rx", 3);
        
        // Feature annotation if enabled
        if (showAnnotations) {
          featureGroup.append("line")
            .attr("x1", feature.start * baseWidth + width / 2)
            .attr("y1", yPos)
            .attr("x2", feature.start * baseWidth + width / 2)
            .attr("y2", yPos > 0 ? yPos + 20 : yPos - 20)
            .attr("stroke", isDark ? "#e5e7eb" : "#4b5563")
            .attr("stroke-width", 1);
          
          featureGroup.append("text")
            .attr("x", feature.start * baseWidth + width / 2)
            .attr("y", yPos > 0 ? yPos + 35 : yPos - 25)
            .attr("text-anchor", "middle")
            .attr("font-size", 10)
            .attr("fill", isDark ? "#e5e7eb" : "#4b5563")
            .text(feature.name);
        }
      });
    }
    
    // Add position markers
    const stepSize = Math.max(1, Math.floor(sequence.length / 10));
    for (let i = 0; i < sequence.length; i += stepSize) {
      dnaGroup.append("line")
        .attr("x1", i * baseWidth)
        .attr("y1", -lineHeight / 2 - 5)
        .attr("x2", i * baseWidth)
        .attr("y2", -lineHeight / 2 - 15)
        .attr("stroke", isDark ? "#9ca3af" : "#6b7280")
        .attr("stroke-width", 1);
      
      dnaGroup.append("text")
        .attr("x", i * baseWidth)
        .attr("y", -lineHeight / 2 - 20)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("fill", isDark ? "#d1d5db" : "#374151")
        .text(i);
    }
  };

  // Render circular DNA visualization
  const renderCircularDNA = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, width: number, height: number) => {
    const radius = Math.min(width, height) / 2 - 100;
    const center = { x: width / 2, y: height / 2 };
    
    // Create a group for the DNA
    const dnaGroup = svg.append("g")
      .attr("transform", `translate(${center.x}, ${center.y})`);
    
    // Create zoomable container
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event: { transform: { k: any; }; }) => {
        dnaGroup.attr("transform", `translate(${center.x}, ${center.y}) scale(${event.transform.k})`);
      });
    
    svg.call(zoom);
    
    // Draw the circular backbone
    dnaGroup.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", isDark ? "#6b7280" : "#9ca3af")
      .attr("stroke-width", 2);
    
    // Calculate angle per base
    const anglePerBase = (2 * Math.PI) / sequence.length;
    
    // Draw bases
    const bases = dnaGroup.selectAll(".base")
      .data(sequence.split(''))
      .enter()
      .append("g")
      .attr("class", "base")
      .attr("transform", (d: any, i: number) => {
        const angle = i * anglePerBase - Math.PI / 2; // Start at top
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return `translate(${x}, ${y}) rotate(${angle * 180 / Math.PI + 90})`;
      });
    
    // Base rectangles
    const baseWidth = Math.min(15, (2 * Math.PI * radius) / sequence.length);
    const baseHeight = 20 * zoomLevel;
    
    bases.append("rect")
      .attr("x", -baseWidth / 2)
      .attr("y", -5)
      .attr("width", baseWidth)
      .attr("height", baseHeight)
      .attr("fill", (d: string | number) => (baseColors as any)[d] || "#999999")
      .attr("opacity", 0.8)
      .attr("rx", 1);
    
    // Add text for bases if there's enough space
    if (sequence.length <= 500) {
      bases.append("text")
        .attr("x", 0)
        .attr("y", baseHeight + 10)
        .attr("text-anchor", "middle")
        .attr("font-family", "monospace")
        .attr("font-size", 10 * zoomLevel)
        .attr("fill", isDark ? "#d1d5db" : "#374151")
        .text((d: any) => d);
    }
    
    // Draw features if enabled
    if (highlightFeatures && featureData.length > 0) {
      const featureArcGenerator = d3.arc<any>()
        .innerRadius(radius + 10)
        .outerRadius(radius + 30)
        .startAngle((d: { start: number; }) => d.start * anglePerBase - Math.PI / 2)
        .endAngle((d: { end: number; }) => d.end * anglePerBase - Math.PI / 2);
      
      // Create feature arcs
      const features = dnaGroup.selectAll(".feature")
        .data(featureData)
        .enter()
        .append("path")
        .attr("class", "feature")
        .attr("d", featureArcGenerator)
        .attr("fill", (d: { type: string; }) => getFeatureColor(d.type))
        .attr("opacity", 0.7);
      
      // Add feature annotations if enabled
      if (showAnnotations) {
        featureData.forEach((feature, i) => {
          const midAngle = ((feature.start + (feature.end - feature.start) / 2) * anglePerBase) - Math.PI / 2;
          const labelRadius = radius + 50;
          const x = Math.cos(midAngle) * labelRadius;
          const y = Math.sin(midAngle) * labelRadius;
          
          // Line from feature to label
          dnaGroup.append("line")
            .attr("x1", Math.cos(midAngle) * (radius + 30))
            .attr("y1", Math.sin(midAngle) * (radius + 30))
            .attr("x2", x)
            .attr("y2", y)
            .attr("stroke", isDark ? "#e5e7eb" : "#4b5563")
            .attr("stroke-width", 1);
          
          // Feature label
          dnaGroup.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", midAngle > 0 && midAngle < Math.PI ? "start" : "end")
            .attr("alignment-baseline", "middle")
            .attr("font-size", 10)
            .attr("fill", isDark ? "#e5e7eb" : "#4b5563")
            .text(feature.name);
        });
      }
    }
    
    // Add position markers
    const stepSize = Math.max(1, Math.floor(sequence.length / 10));
    for (let i = 0; i < sequence.length; i += stepSize) {
      const angle = i * anglePerBase - Math.PI / 2;
      const markerOuterRadius = radius + 5;
      const markerInnerRadius = radius - 5;
      const textRadius = radius - 20;
      
      // Marker line
      dnaGroup.append("line")
        .attr("x1", Math.cos(angle) * markerInnerRadius)
        .attr("y1", Math.sin(angle) * markerInnerRadius)
        .attr("x2", Math.cos(angle) * markerOuterRadius)
        .attr("y2", Math.sin(angle) * markerOuterRadius)
        .attr("stroke", isDark ? "#9ca3af" : "#6b7280")
        .attr("stroke-width", 1);
      
      // Position number
      dnaGroup.append("text")
        .attr("x", Math.cos(angle) * textRadius)
        .attr("y", Math.sin(angle) * textRadius)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", 9)
        .attr("fill", isDark ? "#d1d5db" : "#374151")
        .text(i);
    }
  };

  // Render 3D DNA visualization
  const render3DDNA = (container: HTMLDivElement) => {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x111827 : 0xf9fafb);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 100;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Create orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // DNA parameters
    const dnaLength = sequence.length;
    const basePairDistance = 2.0;
    const helixRadius = 10.0;
    const nucleotidesPerTurn = 10; // Roughly 10 base pairs per turn in B-DNA
    const turnAngle = (Math.PI * 2) / nucleotidesPerTurn;
    const risePerBase = 3.4; // Rise per base pair in Å
    
    // Create DNA backbone material
    const backboneMaterial = new THREE.MeshPhongMaterial({
      color: isDark ? 0x6b7280 : 0x9ca3af,
      shininess: 100
    });
    
    // Create base pair materials
    const baseMaterials: Record<string, THREE.Material> = {
      A: new THREE.MeshPhongMaterial({
        color: parseInt((baseColors.A.replace("#", "0x")), 16),
        shininess: 80
      }),
      T: new THREE.MeshPhongMaterial({
        color: parseInt((baseColors.T.replace("#", "0x")), 16),
        shininess: 80
      }),
      G: new THREE.MeshPhongMaterial({
        color: parseInt((baseColors.G.replace("#", "0x")), 16),
        shininess: 80
      }),
      C: new THREE.MeshPhongMaterial({
        color: parseInt((baseColors.C.replace("#", "0x")), 16),
        shininess: 80
      })
    };
    
    // Helper function to get the complementary base
    const getComplementaryBase = (base: string) => {
      const complementMap: Record<string, string> = {
        A: 'T',
        T: 'A',
        G: 'C',
        C: 'G'
      };
      return complementMap[base] || base;
    };
    
    // Create backbone geometry
    const backboneGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    
    // Create nucleotide base geometry
    const baseGeometry = new THREE.BoxGeometry(2, 0.6, 4);
    
    // Create DNA double helix
    const dnaGroup = new THREE.Group();
    
    // Draw the DNA strands
    for (let i = 0; i < dnaLength; i++) {
      const base = sequence[i];
      const complementaryBase = getComplementaryBase(base);
      
      const angle1 = i * turnAngle;
      const angle2 = angle1 + Math.PI; // Opposite side for the complementary strand
      
      const height = i * risePerBase;
      
      // Calculate positions for the current base pair
      const x1 = Math.cos(angle1) * helixRadius;
      const z1 = Math.sin(angle1) * helixRadius;
      const y1 = height;
      
      const x2 = Math.cos(angle2) * helixRadius;
      const z2 = Math.sin(angle2) * helixRadius;
      const y2 = height;
      
      // Create the base pair
      const baseMesh1 = new THREE.Mesh(baseGeometry, baseMaterials[base]);
      baseMesh1.position.set(x1, y1, z1);
      baseMesh1.lookAt(0, y1, 0);
      baseMesh1.rotateX(Math.PI / 2);
      dnaGroup.add(baseMesh1);
      
      const baseMesh2 = new THREE.Mesh(baseGeometry, baseMaterials[complementaryBase]);
      baseMesh2.position.set(x2, y2, z2);
      baseMesh2.lookAt(0, y2, 0);
      baseMesh2.rotateX(Math.PI / 2);
      dnaGroup.add(baseMesh2);
      
      // Connect the base pairs with a "hydrogen bond"
      const hBondGeometry = new THREE.BoxGeometry(
        Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2)),
        0.2,
        0.2
      );
      const hBondMaterial = new THREE.MeshPhongMaterial({
        color: isDark ? 0xd1d5db : 0x6b7280,
        transparent: true,
        opacity: 0.5
      });
      
      const hBond = new THREE.Mesh(hBondGeometry, hBondMaterial);
      hBond.position.set((x1 + x2) / 2, y1, (z1 + z2) / 2);
      hBond.lookAt(new THREE.Vector3(x2, y1, z2));
      hBond.rotateY(Math.PI / 2);
      dnaGroup.add(hBond);
      
      // Create backbone segments (draw backbone only if there's a next base)
      if (i < dnaLength - 1) {
        const nextAngle1 = (i + 1) * turnAngle;
        const nextHeight = (i + 1) * risePerBase;
        
        const nextX1 = Math.cos(nextAngle1) * helixRadius;
        const nextZ1 = Math.sin(nextAngle1) * helixRadius;
        const nextY1 = nextHeight;
        
        // First strand backbone
        const backboneSegment1 = createBackboneSegment(
          x1, y1, z1,
          nextX1, nextY1, nextZ1,
          backboneMaterial
        );
        dnaGroup.add(backboneSegment1);
        
        // Second strand backbone
        const nextAngle2 = nextAngle1 + Math.PI;
        const nextX2 = Math.cos(nextAngle2) * helixRadius;
        const nextZ2 = Math.sin(nextAngle2) * helixRadius;
        const nextY2 = nextHeight;
        
        const backboneSegment2 = createBackboneSegment(
          x2, y2, z2,
          nextX2, nextY2, nextZ2,
          backboneMaterial
        );
        dnaGroup.add(backboneSegment2);
      }
    }
    
    // Center the DNA model
    dnaGroup.position.y = -(dnaLength * risePerBase) / 2;
    scene.add(dnaGroup);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add another directional light from opposite direction
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (container && container.parentElement) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
      }
    });
    
    // Add features visualization if enabled
    if (highlightFeatures && featureData.length > 0) {
      addFeatureHighlighting(dnaGroup, featureData, risePerBase, turnAngle, helixRadius);
    }
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      controls.update();
      
      // Rotate DNA slowly for effect when not being manipulated
      if (!controls.enableRotate) {
        dnaGroup.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Apply zoom level
    camera.position.z = 200 / zoomLevel;
  };
  
  // Helper function to create backbone segments for 3D DNA
  const createBackboneSegment = (x1: number, y1: number, z1: number, 
                                x2: number, y2: number, z2: number, 
                                material: THREE.Material) => {
    // Calculate midpoint
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const midZ = (z1 + z2) / 2;
    
    // Calculate length
    const length = Math.sqrt(
      Math.pow(x2 - x1, 2) + 
      Math.pow(y2 - y1, 2) + 
      Math.pow(z2 - z1, 2)
    );
    
    // Create cylinder
    const geometry = new THREE.CylinderGeometry(0.4, 0.4, length, 8);
    const cylinder = new THREE.Mesh(geometry, material);
    
    // Position at midpoint
    cylinder.position.set(midX, midY, midZ);
    
    // Orient the cylinder
    cylinder.lookAt(x2, y2, z2);
    cylinder.rotateX(Math.PI / 2);
    
    return cylinder;
  };
  
  // Add feature highlighting to 3D DNA
  const addFeatureHighlighting = (
    dnaGroup: THREE.Group, 
    features: any[], 
    risePerBase: number, 
    turnAngle: number, 
    helixRadius: number
  ) => {
    features.forEach(feature => {
      // Create a highlight cylinder around the DNA segment
      const startHeight = feature.start * risePerBase;
      const endHeight = feature.end * risePerBase;
      const height = endHeight - startHeight;
      
      const featureColor = getFeatureColor(feature.type);
      const highlightMaterial = new THREE.MeshPhongMaterial({
        color: parseInt(featureColor.replace("#", "0x"), 16),
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      
      // Create a cylinder that surrounds the DNA segment
      const highlightGeometry = new THREE.CylinderGeometry(
        helixRadius + 5, helixRadius + 5, 
        height, 
        32, 1, true
      );
      
      const highlightCylinder = new THREE.Mesh(highlightGeometry, highlightMaterial);
      highlightCylinder.position.y = -(dnaGroup.position.y - (startHeight + height / 2));
      
      dnaGroup.add(highlightCylinder);
      
      // Add feature annotation if enabled
      if (showAnnotations) {
        // Create a text sprite for the feature name
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = isDark ? '#e5e7eb' : '#374151'; 
        context.font = '24px Arial';
        context.fillText(feature.name, 0, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(20, 5, 1);
        
        // Position the label to the side of the highlighted region
        const midHeight = startHeight + (height / 2);
        const angle = (feature.start + (feature.end - feature.start) / 2) * turnAngle;
        
        sprite.position.set(
          (helixRadius + 15) * Math.cos(angle),
          -(dnaGroup.position.y - midHeight),
          (helixRadius + 15) * Math.sin(angle)
        );
        
        dnaGroup.add(sprite);
      }
    });
  }

  const renderSequence = () => {
    if (!sequence) {
      return (
        <p className={cn("text-center py-8 font-sans", isDark ? "text-gray-400" : "text-gray-600")}>
          No DNA sequence to display.
        </p>
      );
    }

    // Simple text representation for placeholder
    const displayedSequence = sequence.length > 200 ? sequence.substring(0, 200) + "..." : sequence;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 font-mono text-xs break-all"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
      >
        {displayedSequence.split("").map((nucleotide, index) => (
          <span
            key={index}
            className={cn(
              highlightFeatures && (nucleotide === "A" || nucleotide === "T") ? (isDark ? "text-blue-400" : "text-blue-600") : "",
              highlightFeatures && (nucleotide === "G" || nucleotide === "C") ? (isDark ? "text-green-400" : "text-green-600") : "",
              isDark ? "text-gray-300" : "text-gray-700"
            )}
          >
            {nucleotide}
            {showAnnotations && (index + 1) % 10 === 0 && <span className="opacity-50">|</span>}
            {showAnnotations && (index + 1) % 50 === 0 && <br />}
          </span>
        ))}
      </motion.div>
    );
  };

  return (
    <div className={cn(
      "w-full h-full flex flex-col items-center justify-center rounded-2xl overflow-hidden",
      isDark 
        ? "bg-gradient-to-tr from-gray-800 via-gray-900 to-purple-950" 
        : "bg-gradient-to-tr from-gray-100 via-white to-purple-100"
    )}>
      <div className={cn(
        "w-full p-3 text-sm font-serif border-b",
        isDark ? "border-gray-700 text-purple-300 bg-gray-800/50" : "border-gray-300 text-purple-700 bg-gray-200/50"
      )}>
        Display Mode: <span className="font-semibold">{mode}</span> | Zoom: <span className="font-semibold">{zoomLevel.toFixed(1)}x</span>
      </div>
      <div className="w-full h-full overflow-auto p-4">
        {renderSequence()}
      </div>
      {mode === "3d" && (
        <div className={cn(
            "absolute inset-0 flex items-center justify-center text-lg font-semibold",
             isDark ? "bg-black/70 text-white" : "bg-white/70 text-black"
        )}>
          3D Viewer Placeholder (Integration Required)
        </div>
      )}
    </div>
  );
};