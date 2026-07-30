import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSubmissionRow from "./AdminSubmissionRow";

export default async function AdminSubmissionsPage() {
  const session = await auth();

  // Basic role check
  if (!session || session.user.role !== "ADMIN") {
    // If not admin, redirect to login or home
    redirect("/");
  }

  // Fetch pending submissions
  const pendingSubmissions = await prisma.dataSubmission.findMany({
    where: { status: "PENDING" },
    include: {
      agent: {
        select: {
          name: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Submissions</h1>
        <p className="text-gray-600 mb-8">Review and verify field data to award points to agents.</p>

        {pendingSubmissions.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 text-center text-gray-500">
            No pending submissions right now.
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                  <th className="p-4 font-semibold">Agent</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Photo</th>
                  <th className="p-4 font-semibold">Details</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingSubmissions.map((sub) => (
                  <AdminSubmissionRow key={sub.id} submission={sub} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
