function StatsCard({ title, value }) {

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm">

      <h3 className="text-gray-500">
        {title}
      </h3>

      <h1 className="text-5xl font-bold mt-5">
        {value}
      </h1>

    </div>
  );
}

export default StatsCard;