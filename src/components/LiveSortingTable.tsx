import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowDown, ArrowUp, Pause, Play } from "lucide-react";

interface RowData {
  id: string;
  name: string;
  score: number;
  change: number; // delta applied on last tick
  updatedAt: number; // timestamp ms
}

type SortKey = "score" | "change";

const seedNames = [
  "Astra Labs",
  "Beacon Corp",
  "Cipher Dynamics",
  "Delta Nexus",
  "Echo Systems",
  "Flux Analytics",
  "Gravity Works",
  "Helix Ventures",
  "Ion Forge",
  "Juno Tech",
  "Kitewave",
  "Lumina AI",
];

function generateSeed(): RowData[] {
  return seedNames.map((name, i) => ({
    id: `row-${i}`,
    name,
    score: Math.floor(400 + Math.random() * 600),
    change: 0,
    updatedAt: Date.now(),
  }));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function LiveSortingTable() {
  const [rows, setRows] = useState<RowData[]>(() => generateSeed());
  const [running, setRunning] = useState(true);
  const [intervalMs, setIntervalMs] = useState(1200);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const timerRef = useRef<number | null>(null);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => (b[sortKey] - a[sortKey]) || b.score - a.score);
    return copy;
  }, [rows, sortKey]);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setRows((prev) =>
        prev.map((r) => {
          // random walk: mild noise + occasional spikes
          const spike = Math.random() < 0.1 ? (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 30) : 0;
          const drift = Math.round((Math.random() - 0.45) * 8);
          const delta = clamp(drift + spike, -40, 60);
          const next = clamp(r.score + delta, 0, 9999);
          return {
            ...r,
            score: next,
            change: delta,
            updatedAt: Date.now(),
          };
        })
      );
    }, intervalMs) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [running, intervalMs]);

  function handleToggleRun() {
    setRunning((v) => !v);
  }

  function handleSortChange(value: SortKey) {
    setSortKey(value);
    toast({ title: "Sorting updated", description: `Now sorting by ${value}` });
  }

  return (
    <section aria-label="Live continuously sorting table" className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant={running ? "default" : "secondary"}
            onClick={handleToggleRun}
            className="shadow-elevated"
            aria-pressed={running}
          >
            {running ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Resume
              </>
            )}
          </Button>
          <div className="hidden sm:flex items-center text-sm text-muted-foreground">
            Update every
            <input
              type="range"
              min={400}
              max={3000}
              step={100}
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              aria-label="Update interval"
              className="mx-2 accent-[hsl(var(--brand))]"
            />
            <span>{Math.round(intervalMs / 100) / 10}s</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortKey} onValueChange={(v) => handleSortChange(v as SortKey)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="score">Score (desc)</SelectItem>
              <SelectItem value="change">Change (desc)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-elevated overflow-hidden">
        <Table>
          <TableCaption>Continuously resorting as values update</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>
                <div className="inline-flex items-center gap-1">
                  Score {sortKey === "score" ? <ArrowDown className="h-3.5 w-3.5" /> : null}
                </div>
              </TableHead>
              <TableHead>
                <div className="inline-flex items-center gap-1">
                  Change {sortKey === "change" ? <ArrowDown className="h-3.5 w-3.5" /> : null}
                </div>
              </TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody layout>
            {sorted.map((row, idx) => {
              const positive = row.change >= 0;
              return (
                <motion.tr
                  key={row.id}
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.6 }}
                  className="hover:bg-muted/40"
                >
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell className="font-semibold">{row.score.toLocaleString()}</TableCell>
                  <TableCell>
                    <span
                      className={
                        positive ? "text-success" : "text-destructive"
                      }
                    >
                      <span className="inline-flex items-center gap-1">
                        {positive ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )}
                        {positive ? "+" : ""}
                        {row.change}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {timeAgo(row.updatedAt)}
                  </TableCell>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </Table>
      </div>
    </section>
  );
}

function timeAgo(ts: number) {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 2) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
