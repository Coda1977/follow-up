"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const createInterview = useMutation(api.interviews.create);
  const router = useRouter();

  const handleStart = async () => {
    const { uniqueId } = await createInterview();
    router.push(`/interview/${uniqueId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-8">
      <div className="max-w-3xl w-full text-center space-y-12">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none text-[#1a1a1a]">
          Let's talk.
        </h1>
        <p className="text-2xl md:text-3xl font-light text-[#404040] max-w-2xl mx-auto leading-relaxed">
          Share your real experience working with YP.
          <br />
          The good, the real, everything.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleStart}
            className="bg-[#1a1a1a] text-white px-12 py-5 text-xl font-bold hover:bg-[#e07a5f] transition-colors duration-300"
          >
            Start
          </button>
          <p className="text-sm text-[#404040] font-light">
            ~10 minutes · Your words stay private
          </p>
        </div>
      </div>
    </div>
  );
}
