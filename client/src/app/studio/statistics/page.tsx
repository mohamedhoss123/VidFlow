"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function StatisticsPage() {
  const subscriberData = [
    { month: "Jan", subscribers: 200 },
    { month: "Feb", subscribers: 450 },
    { month: "Mar", subscribers: 800 },
    { month: "Apr", subscribers: 1200 },
    { month: "May", subscribers: 1800 },
    { month: "Jun", subscribers: 2500 },
  ];

  const viewsData = [
    { month: "Jan", views: 4000 },
    { month: "Feb", views: 6500 },
    { month: "Mar", views: 12000 },
    { month: "Apr", views: 17000 },
    { month: "May", views: 23000 },
    { month: "Jun", views: 31000 },
  ];

  const topVideos = [
    {
      id: 1,
      title: "Building a YouTube Clone with Next.js",
      thumbnail: "https://picsum.photos/seed/top1/200/120",
      views: 45200,
    },
    {
      id: 2,
      title: "Intro to Prisma with PostgreSQL",
      thumbnail: "https://picsum.photos/seed/top2/200/120",
      views: 38900,
    },
    {
      id: 3,
      title: "Docker Compose for Beginners",
      thumbnail: "https://picsum.photos/seed/top3/200/120",
      views: 27500,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-2xl font-semibold">Channel Statistics</h1>

        {/* Subscribers Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Subscribers Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={subscriberData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="subscribers"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Views */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Views</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 3 Most Viewed Videos */}
        <Card>
          <CardHeader>
            <CardTitle>Top 3 Most Viewed Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {topVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {video.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
