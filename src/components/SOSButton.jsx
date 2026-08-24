import { Phone } from "lucide-react"

function SOSButton() {
  function handleSOS() {
    alert("SOS feature will be connected in the next phase.")
  }

  return (
    <button
      onClick={handleSOS}
      className="
        absolute
        bottom-6
        right-6
        z-[1000]
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-full
        bg-red-600
        text-white
        shadow-xl
        transition
        hover:bg-red-700
        active:scale-95
      "
      aria-label="Emergency SOS"
    >
      <Phone size={28} />
    </button>
  )
}

export default SOSButton