"use client";
import { UserInformation } from "@/types/UserInfo";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import axios from "axios";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";

const SearchSnippets = ({
  userInfo,
  loading,
  setSnippets,
  setTotalPages,
    currentPage,
    setCurrentPage,
    setIsLoading
}: {
  userInfo: UserInformation;
  loading: boolean;
  setSnippets: (data: any) => void;
  currentPage: number;
  setTotalPages: (item: number) => void;
  setCurrentPage: (item: number) => void;
  setIsLoading: (item: boolean) => void;
}) => {
  const [searchQuery, SetSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounceCallback(SetSearchQuery, 900);

  useEffect(() => {
    // if (searchQuery.length <= 0) return;
    const searchSnippetByUser = async () => {
        const query = {
            searchQuery,
            userInfo,
            limit: 6,
            currentPage
        }
      try {
        const res = await axios.post("http://localhost:3000/api/searchsnippet", query);
        // console.log("Response after query: ", res.data.data.snippets)
        if(res && res.data){
            setSnippets(res.data.data.snippets);
            setTotalPages(res.data.data.totalPages)
        }
      } catch (error) {
        // console.log(error);
      }
    };
    searchSnippetByUser();
  }, [searchQuery, userInfo, currentPage]);

  if (loading) {
    return;
  }
  return (
    <div className="flex items-center w-full justify-center bg-background p-4 text-foreground font-sans">
      <div className=" w-1/2 space-y-4">

        <InputGroup className="bg-muted/30 border-border hover:border-foreground/20 transition-all h-14 rounded-xl px-3 shadow-[0_0_20px_rgba(255,255,255,0.02)]">
          <InputGroupAddon align="inline-start" className="text-muted-foreground">
            <Search className="size-5" />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search Snippets..."
            className="text-foreground placeholder:text-muted-foreground text-lg selection:bg-foreground/20"
            onChange={(e) => {
              debouncedSearchQuery(e.target.value)
            }}
          />
          
        </InputGroup>
      </div>
    </div>
  );
};

export default SearchSnippets;
