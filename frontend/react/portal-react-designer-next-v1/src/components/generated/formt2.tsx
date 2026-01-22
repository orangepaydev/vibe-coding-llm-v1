'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Formt2() {
/* Custom Code start */



/* Custom Code End */

  return (
    <div className="p-6 space-y-4">
  <div className="flex flex-row flex-wrap justify-start items-start bg-green-100 p-4 min-h-[100px] border-2 border-gray-300 rounded-lg">
    <div className="text-sm font-semibold mb-2">{"main"}</div>
    <div className="w-5/12">
      <Label htmlFor="panel-1766364561174-gnffsj92e">{"Textbox"}</Label>
      <Input id="panel-1766364561174-gnffsj92e" type="text" placeholder="Enter text" />
    </div>

    <div className="w-1/2">
      <Label htmlFor="panel-1766364562753-tr3wrq924">{"Textbox"}</Label>
      <Input id="panel-1766364562753-tr3wrq924" type="text" placeholder="Enter text" />
    </div>

    <div className="w-5/12">
      <Label htmlFor="panel-1766364667860-c1wffkxen">{"Textbox"}</Label>
      <Input id="panel-1766364667860-c1wffkxen" type="text" placeholder="Enter text" />
    </div>

    <div className="space-y-2">
      <Label htmlFor="panel-1766364785761-cu4kvl7de">{"Calendar"}</Label>
      <Input id="panel-1766364785761-cu4kvl7de" type="date" />
    </div>

    <div className="space-y-2">
      <Label htmlFor="panel-1766364788410-srxqlzf6y">{"Time"}</Label>
      <Input id="panel-1766364788410-srxqlzf6y" type="time" />
    </div>

    <div className="space-y-2">
      <Label htmlFor="panel-1766364791525-kzgb9p9xz">{"Datetime"}</Label>
      <Input id="panel-1766364791525-kzgb9p9xz" type="datetime-local" />
    </div>

    <div className="w-full mt-2 mb-2 border-2">
      <Label>{"Table"}</Label>
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
