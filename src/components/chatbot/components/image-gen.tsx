/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';
import { Skeleton } from './ui/skeleton';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedImage {
  id: number;
  data: string; // base64-encoded image bytes
}

export default function GenerateImagesClient() {
  const [prompt, setPrompt] = useState<string>('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }
    setError(null);
    setLoading(true);
    setImages([]);
    try {
      const res = await fetch('/api/image-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Server error');
      const imgs: GeneratedImage[] = json.images.map((img: any) => ({
        id: img.id,
        data: `data:image/png;base64,${img.data}`,
      }));
      setImages(imgs);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const SKELETON_COUNT = 4;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="rounded-2xl shadow-lg p-6">
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">AI Image Generator</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Describe your scene..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows={4}
            />
            {error && <p className="text-red-600">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center"
            >
              {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
              {loading ? 'Generating...' : 'Generate Images'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Real Skeleton placeholders while loading */}
      {loading && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
            <Card key={idx} className="rounded-2xl overflow-hidden">
              <Skeleton className="h-48 w-full rounded-t-2xl" />
              <div className="p-4">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Generated images grid */}
      <AnimatePresence>
        {!loading && images.length > 0 && (
          <motion.div
            key="image-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {images.map((img) => (
              <motion.div
                key={img.id}
                whileHover={{ scale: 1.05 }}
                className="rounded-2xl overflow-hidden shadow-xl flex flex-col"
              >
                <img
                  src={img.data}
                  alt={`Generated ${img.id}`}
                  className="object-cover w-full h-48"
                />
                <a
                  href={img.data}
                  download={`image-${img.id}.png`}
                  className="mt-2 block text-center font-medium text-blue-600 hover:underline"
                >
                  Download
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
