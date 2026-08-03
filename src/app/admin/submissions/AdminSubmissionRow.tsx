"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminSubmissionRow({ submission }: { submission: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [grade, setGrade] = useState("")
  const [feedback, setFeedback] = useState("")

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (!grade || isNaN(Number(grade)) || Number(grade) < 0 || Number(grade) > 100) {
      alert("Please provide a valid grade between 0 and 100.");
      return;
    }
    if (!confirm(`Are you sure you want to ${action} this submission with a grade of ${grade}%?`)) return;
    
    setLoading(true)
    try {
      const res = await fetch("/api/admin/verify-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.id,
          action,
          grade: Number(grade),
          feedback
        })
      })

      if (res.ok) {
        router.refresh() // Refresh the page to remove the processed row
      } else {
        alert("Failed to process submission")
      }
    } catch (error) {
      alert("Error processing submission")
    } finally {
      setLoading(false)
    }
  }

  return (
    <tr className={`border-b border-gray-100 ${loading ? 'opacity-50' : ''}`}>
      <td className="p-4 align-top">
        <p className="font-bold text-gray-900">{submission.agent.name || "Unnamed Agent"}</p>
        <p className="text-sm text-gray-500">{submission.agent.phoneNumber || submission.agent.email}</p>
      </td>
      <td className="p-4 align-top">
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
          {submission.category}
        </span>
      </td>
      <td className="p-4 align-top">
        <a href={submission.photoUrl} target="_blank" rel="noreferrer" className="block w-24 h-24 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition">
          <img src={submission.photoUrl} alt="Submission" className="w-full h-full object-cover" />
        </a>
      </td>
      <td className="p-4 align-top max-w-xs">
        <p className="text-sm text-gray-900 font-medium mb-1">
          Geo: <a href={`https://maps.google.com/?q=${submission.latitude},${submission.longitude}`} target="_blank" className="text-[#f06135] underline hover:text-[#d35400]">{submission.latitude.toFixed(4)}, {submission.longitude.toFixed(4)}</a>
        </p>
        {submission.contactInfo && <p className="text-sm text-gray-600 mb-1">Contact: {submission.contactInfo}</p>}
        {submission.customFeatures && (
          <div className="bg-gray-50 p-3 rounded border border-gray-100 mt-2 flex flex-col gap-2">
            {submission.customFeatures.caption && (
              <div>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Caption:</span>
                <p className="text-sm text-gray-800 italic mt-1 line-clamp-3">"{submission.customFeatures.caption}"</p>
              </div>
            )}
            {submission.customFeatures.audioUrl && (
              <div className="mt-1">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Audio Context:</span>
                {submission.customFeatures.audioLanguage && (
                  <span className="ml-2 text-xs text-[#f06135] font-semibold">[{submission.customFeatures.audioLanguage}]</span>
                )}
                <audio controls src={submission.customFeatures.audioUrl} className="w-full mt-2 h-8" />
              </div>
            )}
            {!submission.customFeatures.caption && !submission.customFeatures.audioUrl && (
              <p className="text-xs text-gray-500 line-clamp-3">
                {JSON.stringify(submission.customFeatures)}
              </p>
            )}
          </div>
        )}
      </td>
      <td className="p-4 align-top">
        <div className="flex flex-col gap-2">
          <input 
            type="number" 
            placeholder="Grade (0-100) *" 
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="border border-gray-200 rounded p-2 text-sm w-full focus:ring-1 focus:ring-[#f06135] outline-none"
            min="0" max="100"
            required
          />
          <textarea
            placeholder="Feedback (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="border border-gray-200 rounded p-2 text-sm w-full h-16 resize-none focus:ring-1 focus:ring-[#f06135] outline-none"
          />
          <div className="flex gap-2">
            <button 
              onClick={() => handleAction("APPROVE")}
              disabled={loading}
              className="bg-green-500 text-white font-bold py-2 px-3 rounded-lg hover:bg-green-600 text-xs transition flex-1"
            >
              Approve (+10 pts)
            </button>
            <button 
              onClick={() => handleAction("REJECT")}
              disabled={loading}
              className="bg-red-50 text-red-600 font-bold py-2 px-3 rounded-lg hover:bg-red-100 border border-red-200 text-xs transition flex-1"
            >
              Reject
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}
