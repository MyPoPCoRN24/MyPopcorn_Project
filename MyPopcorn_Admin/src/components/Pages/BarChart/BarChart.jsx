import React from "react";
import ReactECharts from "echarts-for-react";

const BarChart = ({ chartData }) => {
  console.log("barChart======", chartData);

  const option = {
    legend: {
      show: false,
      top: "5%",
      right: "5%",
      itemWidth: 20,
      itemHeight: 10,
      textStyle: {
        color: "#333",
      },
    },
    tooltip: {},   
    yAxis: {
      show: false, // Hide the y-axis
    },
    grid: {
      top: "10%",
      right: "1%",
      bottom: "10%",
      left: "1%",
    },
    series: [
      {
        type: "bar",
        name: "New Users",
        data: chartData?.map((item) => item.newUsers),
        itemStyle: {
          color: "#EB5B00",
          opacity: 0.5, // Default opacity for bars
          borderRadius: [30, 30, 0, 0],
        },
        emphasis: {
          itemStyle: {
            opacity: 1, // Full opacity on hover
          },
        },
        barBorderRadius: [30, 30, 0, 0],
      },
      {
        type: "bar",
        name: "Old Users",
        data: chartData?.map((item) => item.oldUsers),
        itemStyle: {
          color: "#FAB216",
          opacity: 0.5, // Default opacity for bars
          borderRadius: [30, 30, 0, 0],
        },
        emphasis: {
          itemStyle: {
            opacity: 1, // Full opacity on hover
          },
        },
        barBorderRadius: [30, 30, 0, 0],
      },
    ],
    xAxis: {
      type: "category",
      data: chartData?.map((item) => item.date),
    },
  };

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <ReactECharts option={option} />
    </div>
  );
};

export default BarChart;
