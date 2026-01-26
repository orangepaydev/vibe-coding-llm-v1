'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LayoutExperiment1() {
  return (
    <div className="p-6 space-y-4">
  <div className="flex flex-row flex-wrap justify-start items-start col-span-2 row-span-2 bg-white p-4 min-h-[100px] border-2 border-gray-300 rounded-lg">
    <div className="text-base font-semibold mb-2 w-full">{"Others"}</div>
    <div className="w-1/2 p-1">
      <Label htmlFor="panel-1769067320110-dvz4mwk2r">{"Textbox"}</Label>
      <Input id="panel-1769067320110-dvz4mwk2r" type="text" placeholder="Enter text" />
    </div>

    <div className="w-1/2 p-1">
      <Label htmlFor="panel-1769067321641-6uu443uy5">{"Textbox"}</Label>
      <Input id="panel-1769067321641-6uu443uy5" type="text" placeholder="Enter text" />
    </div>

    <div className="pt-3">
      <Button>{"Button"}</Button>
    </div>
  </div>

  <div className="flex flex-row flex-wrap justify-start items-start bg-white p-4 min-h-[100px] border-2 border-gray-300 rounded-lg">
    <div className="text-base font-semibold mb-2 w-full">{"main"}</div>
    <div className="w-1/2 p-3">
      <Label htmlFor="panel-1769055271041-tamc9vc8i">{"Textbox"}</Label>
      <Input id="panel-1769055271041-tamc9vc8i" type="text" placeholder="Enter text" />
    </div>

    <div className="w-1/2 p-3">
      <Label htmlFor="panel-1769055326219-pekhm6alc">{"Textbox"}</Label>
      <Input id="panel-1769055326219-pekhm6alc" type="text" placeholder="Enter text" />
    </div>

    <div className="w-1/2 p-3">
      <Label htmlFor="panel-1769055978344-rvy4gah61">{"Textarea"}</Label>
      <Textarea id="panel-1769055978344-rvy4gah61" placeholder="Enter text" rows={3} />
    </div>

    <div className="w-1/2 p-3">
      <Label htmlFor="panel-1769066316067-cz0wgm71x">{"Textarea"}</Label>
      <Textarea id="panel-1769066316067-cz0wgm71x" placeholder="Enter text" rows={3} />
    </div>

    <div className="w-full m-3 border-2">
      <Label>{""}</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Column 1</TableHead>
            <TableHead>Column 2</TableHead>
            <TableHead>Column 3</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Data 1</TableCell>
            <TableCell>Data 2</TableCell>
            <TableCell>Data 3</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
    </div>
  );
}
