import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Table = ({ data = [], columns = [] }) => {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      gsap.fromTo(
        tableRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [data]);

  return (
    <div
      className="overflow-x-auto p-4 rounded-xl shadow-lg bg-white"
      ref={tableRef}
    >
      <table className="min-w-full table-auto border-collapse text-sm text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-2 border-b font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-2 border-b">
                    {row[col.field]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-4 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
