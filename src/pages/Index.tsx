import LiveSortingTable from "@/components/LiveSortingTable";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <header className="bg-gradient-primary text-primary-foreground">
        <div className="container py-12 sm:py-16">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Continuously Sorting Table</h1>
          <p className="mt-3 text-base sm:text-lg text-primary-foreground/85 max-w-2xl">
            A realtime leaderboard that reorders itself as values change. Smooth, fast, and delightful.
          </p>
        </div>
      </header>

      <section className="container py-8 sm:py-12">
        <LiveSortingTable />
      </section>
    </main>
  );
};

export default Index;
