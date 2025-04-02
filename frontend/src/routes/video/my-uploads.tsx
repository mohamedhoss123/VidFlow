import { createFileRoute } from '@tanstack/react-router'
import { MoreVertical, Trash2, Edit, Eye, BarChart2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
export const Route = createFileRoute('/video/my-uploads')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MyUploadsPage/>
}

const MyUploadsPage = () => {
  const videos = [
    {
      id: 1,
      title: "How to Build a React Dashboard",
      thumbnailUrl: "/api/placeholder/240/135",
      views: 12543,
      likes: 876,
      comments: 124,
      uploadDate: "2025-03-28",
      duration: "15:42",
      visibility: "Public",
      status: "Published"
    },
    {
      id: 2,
      title: "Shadcn UI Tutorial for Beginners",
      thumbnailUrl: "/api/placeholder/240/135",
      views: 8932,
      likes: 745,
      comments: 89,
      uploadDate: "2025-03-15",
      duration: "22:18",
      visibility: "Public",
      status: "Published"
    },
    {
      id: 3,
      title: "Advanced TypeScript Patterns for React",
      thumbnailUrl: "/api/placeholder/240/135",
      views: 5421,
      likes: 432,
      comments: 67,
      uploadDate: "2025-03-01",
      duration: "31:05",
      visibility: "Public",
      status: "Published"
    },
    {
      id: 4,
      title: "Creating Custom Hooks in React",
      thumbnailUrl: "/api/placeholder/240/135",
      views: 3210,
      likes: 298,
      comments: 42,
      uploadDate: "2025-02-15",
      duration: "18:36",
      visibility: "Private",
      status: "Draft"
    }
  ];

  function formatNumber(num:number) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  }

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Channel content</h1>
      </div>
      
      <Card>
        <CardHeader className="bg-gray-50 p-4">
          <div className="grid grid-cols-12 text-sm font-medium text-gray-500">
            <div className="col-span-5">Video</div>
            <div className="col-span-1 text-center">Visibility</div>
            <div className="col-span-2 text-center">Date</div>
            <div className="col-span-1 text-center">Views</div>
            <div className="col-span-1 text-center">Comments</div>
            <div className="col-span-1 text-center">Likes</div>
            <div className="col-span-1"></div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {videos.map(video => (
            <div key={video.id} className="grid grid-cols-12 items-center p-4 border-b hover:bg-gray-50">
              <div className="col-span-5 flex gap-3">
                <div className="relative">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-32 h-18 rounded object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                    {video.duration}
                  </span>
                </div>
                <div className="flex flex-col justify-between py-1">
                  <h3 className="font-medium line-clamp-2">{video.title}</h3>
                  <div className="text-sm text-gray-500">
                    {video.status === "Draft" ? 
                      <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">Draft</Badge> : 
                      <span>{video.status}</span>
                    }
                  </div>
                </div>
              </div>
              <div className="col-span-1 text-center">
                <Badge variant={video.visibility === "Public" ? "default" : "secondary"} className="font-normal">
                  {video.visibility}
                </Badge>
              </div>
              <div className="col-span-2 text-center text-sm">{video.uploadDate}</div>
              <div className="col-span-1 text-center flex items-center justify-center gap-1">
                <Eye className="h-4 w-4 text-gray-500" />
                <span>{formatNumber(video.views)}</span>
              </div>
              <div className="col-span-1 text-center">{formatNumber(video.comments)}</div>
              <div className="col-span-1 text-center">{formatNumber(video.likes)}</div>
              <div className="col-span-1 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart2 className="mr-2 h-4 w-4" /> Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <TrendingUp className="mr-2 h-4 w-4" /> Promote
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
