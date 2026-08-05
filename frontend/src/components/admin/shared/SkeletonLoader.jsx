import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 3, className = '' }) => {
  const Pulse = ({ h = 'h-4', w = 'w-full', rounded = 'rounded' }) => (
    <div className={`${h} ${w} ${rounded} bg-white/5 animate-pulse`} />
  );

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Pulse h="h-10" w="w-10" rounded="rounded-xl" />
              <Pulse h="h-5" w="w-16" rounded="rounded-full" />
            </div>
            <Pulse h="h-8" w="w-24" />
            <Pulse h="h-3" w="w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Header */}
        <div className="bg-white/3 rounded-xl px-4 py-3 flex gap-4">
          {[10, 20, 20, 15, 15, 20].map((w, i) => (
            <Pulse key={i} h="h-3" w={`w-[${w}%]`} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-[#1A1A1A] rounded-xl px-4 py-4 flex items-center gap-4">
            <Pulse h="h-8" w="w-8" rounded="rounded-full" />
            <div className="flex-1 space-y-2">
              <Pulse h="h-3" w="w-32" />
              <Pulse h="h-2.5" w="w-48" />
            </div>
            <Pulse h="h-5" w="w-20" rounded="rounded-full" />
            <Pulse h="h-7" w="w-7" rounded="rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={`bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <Pulse h="h-4" w="w-32" />
            <Pulse h="h-3" w="w-24" />
          </div>
          <Pulse h="h-8" w="w-24" rounded="rounded-xl" />
        </div>
        <div className="h-48 bg-white/3 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
            <Pulse h="h-9" w="w-9" rounded="rounded-full" />
            <div className="flex-1 space-y-2">
              <Pulse h="h-3" w="w-3/4" />
              <Pulse h="h-2.5" w="w-1/2" />
            </div>
            <Pulse h="h-3" w="w-16" />
          </div>
        ))}
      </div>
    );
  }

  return <div className={`h-16 bg-white/5 rounded-xl animate-pulse ${className}`} />;
};

export default SkeletonLoader;
