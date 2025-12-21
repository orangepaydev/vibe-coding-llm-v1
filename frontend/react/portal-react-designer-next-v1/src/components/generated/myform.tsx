'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Myform() {
  return (
    <div className="p-6 space-y-4">
  <div className="flex flex-row flex-wrap justify-start items-start bg-white p-4 min-h-[100px] border-2 border-gray-300 rounded-lg">
    <div className="text-sm font-semibold mb-2">{""}</div>
    <div className="w-1/2 p-1">
      <Label htmlFor="panel-1766307171895-xm0u4q310">{"Textbox"}</Label>
      <Input id="panel-1766307171895-xm0u4q310" type="text" placeholder="Enter text" />
    </div>

    <div className="w-1/2 p-4">
      <Label htmlFor="panel-1766307201339-pvdt6clkx">{"Textarea"}</Label>
      <Textarea id="panel-1766307201339-pvdt6clkx" placeholder="Enter text" rows={3} />
    </div>

    <div className="w-1/2 p-1">
      <Label htmlFor="panel-1766307204392-10jqbv2j8">{"Textarea"}</Label>
      <Textarea id="panel-1766307204392-10jqbv2j8" placeholder="Enter text" rows={3} />
    </div>

    <div className="w-1/2 p-5">
      <Label>{"Label"}</Label>
    </div>

    <div className="w-1/2 m-4">
      <Label>{"Label"}</Label>
    </div>
  </div>

  <div className="flex flex-col undefined justify-start items-start bg-white p-4 min-h-[100px] border-2 border-gray-300 rounded-lg">
    <div className="text-sm font-semibold mb-2">{""}</div>
    <div className="h-1/2 p-2 m-2 border-t-0">
      <Label htmlFor="panel-1766307195153-8clc1ig1g">{"Select"}</Label>
      <Select>
        <SelectTrigger id="panel-1766307195153-8clc1ig1g">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option-1">Option 1</SelectItem>
          <SelectItem value="option-2">Option 2</SelectItem>
          <SelectItem value="option-3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="h-1/2">
      <Label htmlFor="panel-1766307198345-7r1hso74v">{"Select"}</Label>
      <Select>
        <SelectTrigger id="panel-1766307198345-7r1hso74v">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option-1">Option 1</SelectItem>
          <SelectItem value="option-2">Option 2</SelectItem>
          <SelectItem value="option-3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  <div className="flex flex-row  justify-start items-start bg-white p-4 min-h-[100px] border-2 border-gray-300 rounded-lg">
    <div className="text-sm font-semibold mb-2">{"Drop Panel"}</div>
    <div className="space-y-2">
      <Label htmlFor="panel-1766328556984-ocwbpvn6r">{"Textbox"}</Label>
      <Input id="panel-1766328556984-ocwbpvn6r" type="text" placeholder="Enter text" />
    </div>
  </div>
    </div>
  );
}
