import { useEffect, useState } from "react"
import { Search, Filter, Badge, Play, } from "lucide-react"
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {keepPreviousData, useInfiniteQuery, useQuery} from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { createFileRoute, invariant, Link } from "@tanstack/react-router"
import { api } from "@/utils/api"
import { format } from "date-fns";


export const Route = createFileRoute('/home/')({
  component: RouteComponent,
})

function RouteComponent() {
 return <MyUploadsPage></MyUploadsPage>
}

export default function MyUploadsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [cursor,setCursor] = useState(undefined)
  const fetchVideos = async ({pageParam}:{pageParam:number}):Promise<Array<{}>>=> (await api.get("/videos"+(pageParam?`?cursor=${pageParam}`:""))).data
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
  } = useInfiniteQuery({
    queryFn:fetchVideos,
    queryKey:["videos"],
    initialPageParam:undefined,
    getNextPageParam:(lastPage:[{id:number}])=>{
      return lastPage[lastPage.length-1]?.id
    }
  })
  const {ref,inView}= useInView()
  useEffect(() => {
    console.log(data)
  },[isFetching])
  useEffect(()=>{
    if(inView){
      fetchNextPage()
    }
  },[fetchNextPage,inView])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Your Feed</h1>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search uploads..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>

        </div>
      </div>

      {status =="pending" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-[180px] w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : data?.pages? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.pages.map((page) =>
            page.map((video: any) => (
              <Link
                to={`/watch/${video.id}`}
                key={video.id}>
              <Card key={video.id} className="overflow-hidden group">
                <div className="relative">
                  <img
                    src={video.thumbnailUrl || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-[180px] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="icon" className="rounded-full">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/70">{video.duration}</Badge>
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{video.name}</h3>
                  </div>


                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{format(video.createdAt, "MMM d, yyyy")}</span>
                  </div>
                </CardContent>
              </Card></Link>
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No videos found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? `No videos matching "${searchQuery}" were found.` : "You haven't uploaded any videos yet."}
          </p>
          <Button asChild>
            <Link to="/video/upload">Upload Your First Video</Link>
          </Button>
        </div>
      )}

      <div ref={ref}></div>
    </div>
  )
}

