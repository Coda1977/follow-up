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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">
          Feedback Interview
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for taking a few minutes to share your experience
          working with YP. Your honest feedback is valuable and will
          help improve future engagements.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This conversation takes about 5-10 minutes.
        </p>
        <button
          onClick={handleStart}
          className="bg-blue-500 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-600 transition"
        >
          Begin Interview
        </button>
        <p className="text-xs text-gray-400 mt-6">
          Your responses are confidential
        </p>
      </div>
    </div>
  );
}
