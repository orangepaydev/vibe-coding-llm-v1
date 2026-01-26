'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

export default function QueryPerson() {
  return (
    <div className="p-6 space-y-4">
  <div className="flex flex-row flex-wrap justify-start items-start bg-white p-4 min-h-[100px] border-2 border-gray-300 rounded-lg">
    <div className="text-base font-semibold mb-2 w-full">{"User Search"}</div>
    <div className="w-1/2 p-1">
      <Label htmlFor="panel-1769125498329-esatq96lf">{"First Name"}</Label>
      <Input id="panel-1769125498329-esatq96lf" type="text" placeholder="Enter text" />
    </div>

    <div className="w-1/2 p-1">
      <Label htmlFor="panel-1769125502836-azkkgvg9h">{"Last Name"}</Label>
      <Input id="panel-1769125502836-azkkgvg9h" type="text" placeholder="Enter text" />
    </div>

    <div className="w-full p-1">
      <Label htmlFor="panel-1769125506907-x99hu032k">{"Select"}</Label>
      <Select>
        <SelectTrigger id="panel-1769125506907-x99hu032k">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option-1">Option 1</SelectItem>
          <SelectItem value="option-2">Option 2</SelectItem>
          <SelectItem value="option-3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="w-1/2 p-1">
      <Label>{"User Type"}</Label>
      <div className="flex items-center space-x-2">
        <Checkbox id="checkbox-1" />
        <Label htmlFor="checkbox-1">Intern</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="checkbox-2" />
        <Label htmlFor="checkbox-2">Employee</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="checkbox-3" />
        <Label htmlFor="checkbox-3">Manager</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="checkbox-4" />
        <Label htmlFor="checkbox-4">Director</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="checkbox-5" />
        <Label htmlFor="checkbox-5">Executive</Label>
      </div>
    </div>

    <div className="w-1/2 p-1">
      <Label>{"Radio"}</Label>
      <RadioGroup defaultValue="option-1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-1" id="option-1" />
          <Label htmlFor="option-1">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-2" id="option-2" />
          <Label htmlFor="option-2">Deleted</Label>
        </div>
      </RadioGroup>
    </div>

    <div className="w-1/2 p-1">
      <Label htmlFor="panel-1769135647503-809r7dqbk">{"Employment Start Search"}</Label>
      <Input id="panel-1769135647503-809r7dqbk" type="date" />
    </div>

    <div className="w-1/2 p-1">
      <Label htmlFor="panel-1769135667765-c18ci7zj8">{"Employment End Search"}</Label>
      <Input id="panel-1769135667765-c18ci7zj8" type="date" />
    </div>

    <div>
      <Label>{"Label"}</Label>
    </div>

    <div className="m-1">
      <Button>{"Search"}</Button>
    </div>
  </div>
    </div>
  );
}
