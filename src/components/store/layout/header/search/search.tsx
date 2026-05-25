"use client";
import { SearchResult } from "@/src/lib/types";
import { Search as SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useState } from "react";
import SearchSuggestions from "@/src/components/store/layout/header/search/suggestions";
export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);
  const { push, replace } = useRouter();

  const search_query_url = params.get("search");

  const [searchQuery, setSearchQuery] = useState<string>(
    search_query_url || ""
  );
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (pathname !== "/browse") {
      // We are not in browse page
      push(`/browse?search=${searchQuery}`);
    } else {
      // We are in browse page
      if (!searchQuery) {
        params.delete("search");
      } else {
        params.set("search", searchQuery);
      }
      replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (pathname === "/browse") return;

    if (value.length >= 2) {
      try {
        const res = await fetch(`/api/search-products?search=${encodeURIComponent(value)}`);
        if (!res.ok) {
          setSuggestions([]);
          return;
        }
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative lg:w-full flex-1">
      <form
        onSubmit={handleSubmit}
        className="h-10 rounded-3xl bg-white/40 relative border border-black/20 flex"
      >
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-white placeholder:text-white/70 flex-1 border-none pl-2.5 m-2.5 outline-none"
          value={searchQuery}
          onChange={handleInputChange}
        />
        {suggestions.length > 0 && (
          <SearchSuggestions suggestions={suggestions} query={searchQuery} />
        )}
        <button
          type="submit"
          className="border border-black/20 rounded-[20px] w-[56px] h-8 mt-1 mr-1 mb-0 ml-0 bg-white/40 text-white grid place-items-center cursor-pointer hover:bg-white/60"
        >
          <SearchIcon />
        </button>
      </form>
    </div>
  );
}