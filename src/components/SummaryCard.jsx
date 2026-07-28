function SummaryCard({
  title,
  content,
}) {

  return (

    <div className="bg-white rounded-3xl p-6">

      <h2 className="font-bold text-xl mb-3">
        {title}
      </h2>

      <p>{content}</p>

    </div>

  );
}

export default SummaryCard;