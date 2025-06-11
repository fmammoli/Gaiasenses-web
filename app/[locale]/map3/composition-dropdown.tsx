
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CompositionsInfo from "@/components/compositions/compositions-info"
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const compositions = Object.entries(CompositionsInfo);


type  CompositionDropdownProps = {
  searchParams:{
    lat?:string,
    lng?:string,
    composition?:string,
    mode?:string
  }
  weatherData?: any; 
  lightningData?: any; 
  fireData?: any; 
}

export function CompositionDropdown({searchParams,weatherData}:CompositionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={"icon"}> <ChevronDown /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Compositions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={searchParams.composition} className="overflow-y-scroll h-48"> 
          {compositions.map((item, index)=>{
            return (
                <Link href={{query: {...searchParams, composition: item[0], temperature: weatherData.temp,mode:"player"}}} key={index}> 
                  <DropdownMenuRadioItem value={item[0]}>
                    {item[0]}
                  </DropdownMenuRadioItem>
                </Link>
              
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
