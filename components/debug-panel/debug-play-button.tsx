import { Button } from "../ui/button";
import { useSearchParams } from "next/navigation";

export default function DebugPlayButton() {
  const params = useSearchParams();

  function togglePlay() {}
  return (
    <Button id="play-button" className="mt-4" onClick={togglePlay}>
      Play
    </Button>
  );
}
