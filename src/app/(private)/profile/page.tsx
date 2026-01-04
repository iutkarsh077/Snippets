"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import CustomDialog from "./_components/CustomDialog";
import CustomDialogForProfileImage from "./_components/CustomDialogProfileImage";
import DialogForOtherSections from "./_components/DialogForOtherSection";
import CodeCard from "@/app/(home)/_components/Card";
import { SnippetType } from "@/app/snippets/page";
import { GetUserDetailsInProfile } from "../../../../actions/GetUserDetailsInProfile";
import { LogoutUser } from "../../../../actions/LogoutUser";
import { GetPostForProfile } from "../../../../actions/GetParticularUserPost";
import { useToast } from "@/hooks/use-toast";
import ImageCard, {
  ImageCardProps,
} from "@/app/feeds/_components/HeaderImageCard";
import { DeleteFeed } from "../../../../actions/DeleteFeed";
import { GetLatestFeed } from "../../../../actions/GetLatestFeed";
import { GetFeedByProfile } from "../../../../actions/GetfeedByProfile";
import { UserInformation } from "@/types/UserInfo";
import SearchSnippets from "@/components/search/SnippetSearch";

export default function Profile() {
  const [cardData, setCardData] = useState<any | null>(null);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenforCover, setIsOpenForCover] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workplace, setWorkplace] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [badges, setBadges] = useState<any[]>();
  const [userName, setUsername] = useState("");
  const [snippets, setSnippets] = useState<SnippetType[] | null>(null);
  const [clickedReadMore, setClickedReadMore] = useState(false);
  const [showSnippets, setShowSnippets] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInformation>({
    id: "",
    name: "",
    email: "",
    username: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const baseUrl = "https://snippets-saas-production.vercel.app";

  // const getAllSnippetsForProfile = async () => {
  //   setLoading(true);
  //   const res = await GetPostForProfile();
  //   if (res && res.data) {
  //     setSnippets(res.data as any);
  //     // console.log("Response before query: ", res.data)
  //   }
  //   setLoading(false);
  // };

  const fetchFeedData = useCallback(async () => {
    try {
      const res = await GetFeedByProfile();
      if (res.status === false) {
        throw new Error(res.msg);
      }
      // console.log(res);
      setCardData(res?.feedsData);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    // getAllSnippetsForProfile();
    fetchFeedData();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const res = await GetUserDetailsInProfile();
        if (res.status === false) {
          throw new Error(res.msg);
        }
        // console.log("user info is: ", res);
        setProfileImage(res?.decodeCookieValue?.profileImage as string);
        setCoverImage(res?.decodeCookieValue?.backgroundImage as string);
        setName(res?.decodeCookieValue?.name as string);
        setWorkplace(res.decodeCookieValue?.workplace as string);
        setAbout(res.decodeCookieValue?.about as string);
        setLocation(res.decodeCookieValue?.location as string);
        setBadges(res.decodeCookieValue?.badges as string[]);
        setUsername(res.decodeCookieValue?.username as string);
        setUserInfo((prev)=>({
          id: res?.decodeCookieValue?.id as string,
          name: res?.decodeCookieValue?.name as string,
          email: res?.decodeCookieValue?.email as string,
          username: res?.decodeCookieValue?.username as string,
        }))
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [dialogOpen]);

  const handleLogout = async () => {
    await LogoutUser();
    window.location.reload();
  };

  const handleCopyProfile = () => {
    const profile = `${baseUrl}/profile/${userName}`;
    navigator.clipboard.writeText(profile);
    // console.log(profile)
    toast({
      title: "URL Copied!",
      description: "Profile URL has been copied to clipboard.",
    });
  };

  const handleDeleteFeed = async (feedId: string) => {
    try {
      setCardData((prevData: any) =>
        prevData ? prevData.filter((feed: any) => feed.id !== feedId) : prevData
      );
      const res = await DeleteFeed(feedId);
      if (res.status === false) {
        throw new Error(res.msg);
      }
      toast({
        title: "Feed deleted successfully.",
        duration: 2000,
      });
    } catch (error) {
      // console.log(error);
      toast({
        title: "failed to delete feeds.",
        duration: 2000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center pt-60">
        <Loader2 className="animate-spin h-16 lg:h-28 w-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-background mb-20 mt-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Banner Image */}
        <div className="h-48 overflow-hidden relative rounded-t-lg">
          <div className="absolute right-4 top-2">
            <CustomDialog
              isOpenforCover={isOpenforCover}
              setIsOpenForCover={setIsOpenForCover}
              setCoverImage={setCoverImage}
            />
          </div>
          <Image
            src={
              coverImage ||
              "http://res.cloudinary.com/dakddv1pm/image/upload/v1744560220/posts/vzw9nmxv2v4eab4ysgdu.jpg"
            }
            alt="Profile banner"
            width={768}
            height={192}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Picture */}
        <div className="relative flex -mt-16 mb-4 ml-3">
          <p className="absolute left-28 bottom-0">
            <CustomDialogForProfileImage
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              setProfileImage={setProfileImage}
            />
          </p>
          <Image
            src={
              profileImage ||
              "http://res.cloudinary.com/dakddv1pm/image/upload/v1744560220/posts/vzw9nmxv2v4eab4ysgdu.jpg"
            }
            alt="Profile picture"
            width={150}
            height={400}
            className="rounded-full h-36 border-2 bg-black border-white"
          />
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-6"
        >
          {/* Profile Info */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{name || "Profile Name"}</h1>
              <p className="text-muted-foreground">{userName}</p>
              <p className="text-muted-foreground">{workplace}</p>
              <p className="text-sm text-muted-foreground mt-1">{location}</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-center gap-5 hover:cursor-pointer p-2 text-white rounded-md">
              <div className="flex flex-col sm:flex-row gap-y-3 sm:gap-x-5">
                {name && <Button onClick={handleLogout}>Logout</Button>}
                {name && <Button onClick={handleCopyProfile}>Share</Button>}
              </div>
              <DialogForOtherSections
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="flex gap-2 mb-6">
            {badges?.slice(0, 3).map((badge: any, index) => (
              <Badge variant="secondary" key={index}>
                {badge}
              </Badge>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* About Section */}
      {about.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg p-6 mt-4 xl:mx-6"
        >
          <h2 className="text-xl font-semibold mb-4">About Me</h2>
          <div className="space-y-4">
            {clickedReadMore ? (
              <p className="break-words">{about}</p>
            ) : (
              <p className="break-words">{about.slice(0, 400)}...</p>
            )}
          </div>
          {about.length >= 300 && (
            <Button
              onClick={() => setClickedReadMore(!clickedReadMore)}
              variant="ghost"
              className="mt-4"
            >
              {clickedReadMore ? "Read Less..." : "Read More..."}
            </Button>
          )}
        </motion.div>
      )}

      <div className="flex  justify-around text-xl">
        <p
          onClick={() => {
            setShowSnippets(true);
          }}
          className={`ease-in-out duration-200 hover:cursor-pointer border-2 px-4 py-1 rounded-lg ${
            showSnippets === true
              ? "dark:text-white text-black"
              : "text-gray-500"
          }`}
        >
          Snippets
        </p>
        <p
          onClick={() => {
            setShowSnippets(false), fetchFeedData;
          }}
          className={`ease-in-out duration-200 hover:cursor-pointer border-2 px-4 py-1 rounded-lg ${
            showSnippets === false
              ? "dark:text-white text-black"
              : "text-gray-500"
          }`}
        >
          Feed
        </p>
      </div>
      <div className="my-10">
        {showSnippets === true ? (
          <div className="flex flex-col items-center">
            <SearchSnippets userInfo={userInfo} loading={loading} setSnippets={setSnippets} currentPage={currentPage} setTotalPages={setTotalPages} setCurrentPage={setCurrentPage} setIsLoading={setLoading}/>
           <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 gap-x-6 gap-y-14 mx-3 mt-10  ">
             {snippets
              ?.sort(
                (a: any, b: any) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((snippet, index) => (
                <div key={index}>
                  <CodeCard snippet={snippet} />
                </div>
              ))}
           </div>
              <div className="flex gap-x-6 items-center mt-10">
                {
                  Array.from({ length: Math.ceil(totalPages/ 6) }, (v, i)=> i + 1).map((item, index)=>(
                    <p key={index} onClick={()=>setCurrentPage(item)} className={`bg-black text-center px-2 rounded-md py-2 w-10 text-white dark:bg-white hover:cursor-pointer dark:text-black ${currentPage === item && "rotate-12" } `}>
                      {item}
                    </p>
                  ))
                }
              </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 gap-x-6 gap-y-14 mx-3 mt-10">
            {cardData?.map((cardDataItems: ImageCardProps, index: number) => (
              <motion.div
                key={index}
                className="max-w-md w-full min-h-full flex flex-col justify-between rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 }}
              >
                <ImageCard
                  {...cardDataItems}
                  handleDeleteFeed={handleDeleteFeed}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
