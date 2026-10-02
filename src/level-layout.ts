export function chooseLevelLayout(
  count: number,
  width: number,
  height: number,
  gap: number,
  maximum: number,
  minimum: number,
  pagerHeight: number,
) {
  function fit(items: number, availableHeight: number) {
    let best = { columns: 1, size: 0 };
    for (let columns = 1; columns <= Math.max(1, items); columns++) {
      const rows = Math.max(1, Math.ceil(items / columns));
      const size = Math.floor(
        Math.min(
          maximum,
          (width - gap * (columns - 1)) / columns,
          (availableHeight - gap * (rows - 1)) / rows,
        ),
      );
      if (size > best.size) best = { columns, size };
    }
    return best;
  }
  const whole = fit(count, height);
  // Keep comfortable touch targets; paginate instead of shrinking below the minimum.
  if (whole.size >= minimum || count <= 1) {
    return { ...whole, pageSize: Math.max(1, count), pageCount: 1 };
  }
  const pageHeight = Math.max(1, height - pagerHeight);
  const capacity = Math.max(
    1,
    Math.floor((width + gap) / (minimum + gap)) * Math.floor((pageHeight + gap) / (minimum + gap)),
  );
  const pageCount = Math.ceil(count / capacity);
  const pageSize = Math.ceil(count / pageCount);
  return { ...fit(pageSize, pageHeight), pageSize, pageCount };
}
