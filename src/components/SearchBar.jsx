import { Search } from "lucide-react"

function SearchBar() {
  return (
    <div className="absolute left-1/2 top-5 z-[1000] w-[90%] max-w-xl -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg">
        <Search
          size={22}
          className="text-gray-500"
        />

        <input
          type="text"
          placeholder="Where do you want to go?"
          className="w-full bg-transparent text-gray-800 outline-none"
        />
      </div>
    </div>
  )
}

export default SearchBar