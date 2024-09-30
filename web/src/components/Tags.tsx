import { FaGlobeAfrica } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const Tags = () => {
  return (
    <Select>
      <SelectTrigger className="w-fit h-fit text-xs  bg-neutral-300">
        <SelectValue className="text-xl" placeholder="Select audience" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="public">
            <div className="flex flex-row items-center space-x-1">
              <FaGlobeAfrica />
              <span>Public</span>
            </div>
          </SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default Tags;
