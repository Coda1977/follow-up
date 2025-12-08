"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AdminPage() {
  const interviews = useQuery(api.interviews.getAllCompleted);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Completed Interviews</h1>

      {!interviews?.length ? (
        <p className="text-gray-500">No completed interviews yet.</p>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <a
              key={interview._id}
              href={`/admin/${interview.uniqueId}`}
              className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <p className="font-medium text-gray-900">Interview #{interview.uniqueId}</p>
              <p className="text-sm text-gray-600">
                Completed: {new Date(interview.completedAt!).toLocaleString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
