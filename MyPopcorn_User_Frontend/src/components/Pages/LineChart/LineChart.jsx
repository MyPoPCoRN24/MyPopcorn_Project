import React, { useRef, useEffect } from "react";
import * as echarts from "echarts";

const LineChart = ({ data }) => {
  const chartRef = useRef(null);

  const getDayOfWeek = (dateString) => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = new Date(dateString);
    return daysOfWeek[date.getUTCDay()]; // Use getUTCDay() for consistency in results
  };

  const transformedData = data?.map((item) => ({
    ...item,
    day: getDayOfWeek(item?.date),
  }));

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current);

    const dailyRewardPoints = transformedData?.map(
      (item) => item.dailyRewardPoints
    );
    const days = transformedData?.map((item) => item.day);

    const option = {
      tooltip: {
        trigger: "axis", // Show tooltip when hovering over the axis
        axisPointer: {
          type: "cross", // Type of the axis pointer (cross line)
          crossStyle: {
            color: "#999", // Color of the cross line
          },
        },
      },
      xAxis: {
        type: "category",
        data: days,
      },
      yAxis: {
        type: "value",
        axisLabel: {
          show: false,
        },
      },
      grid: {
        left: "1%",
        right: "4%",
        bottom: "3%",
        top: "15%",
        containLabel: true,
      },
      series: [
        {
          data: dailyRewardPoints,
          type: "line",
          lineStyle: {
            color: "#EB5B00",
            width: 4,
          },
          itemStyle: {
            color: "#000", // Point color
          },
        },
      ],
    };

    chartInstance.setOption(option);

    // Resize chart on window resize
    window.addEventListener("resize", () => {
      chartInstance.resize();
    });

    return () => {
      window.removeEventListener("resize", () => {
        chartInstance.resize();
      });
      chartInstance.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: "100%", height: "300px" }} />;
};

export default LineChart;
