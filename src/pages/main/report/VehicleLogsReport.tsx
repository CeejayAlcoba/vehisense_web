import React, { useRef, useState } from "react";
import { Button, DatePicker, Table, Space, message, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DownloadOutlined,
  PrinterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useReactToPrint } from "react-to-print";
import _vehicleLogsService from "../../../services/VehicleLogsService";
import { VehicleLogs, VehicleLogsDateRange, VehicleLogsWithHourSpent } from "../../../types/VehicleLogs";

const { RangePicker } = DatePicker;

const VehicleLogsReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<VehicleLogsWithHourSpent[]>([]);

  const printRef = useRef<HTMLDivElement>(null);

  const columns: ColumnsType<VehicleLogs> = [
    {
      title: "Plate Number",
      dataIndex: "plateNumber",
      key: "plateNumber",
    },
    {
      title: "Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
    },
    {
      title: "Registered",
      dataIndex: "isRegistered",
      key: "isRegistered",
      render: (value: boolean) =>
        value ? (
          <Tag color="green">Registered</Tag>
        ) : (
          <Tag color="red">Not Registered</Tag>
        ),
    },
    {
      title: "Allowed",
      key: "isAllowed",
      render: (_, record) => {
        if (!record.isRegistered && record.isAllowed) {
          return <Tag color="blue">Allowed</Tag>;
        }
        return <Tag color="default">—</Tag>;
      },
    },
    {
      title: "Entry Time",
      dataIndex: "entryTime",
      key: "entryTime",
      render: (value?: Date) =>
      value ? dayjs(value).format("YYYY-MM-DD hh:mm A") : "—"
    },
    {
      title: "Exit Time",
      dataIndex: "exitTime",
      key: "exitTime",
      render: (value?: Date) =>
       value ? dayjs(value).format("YYYY-MM-DD hh:mm A") : "—"
    },
     {
      title: "Hours Spent",
      dataIndex: "hoursSpent",
      key: "hoursSpent",
     
    },
  ];

  const fetchData = async () => {
    if (!dateRange) {
      message.warning("Please select a date range.");
      return;
    }

    const [start, end] = dateRange;
    const params: VehicleLogsDateRange = {
      dateFrom: start.format("YYYY-MM-DD"),
      dateTo: end.format("YYYY-MM-DD"),
    };

    try {
      setLoading(true);
      const data = await _vehicleLogsService.getAllAsync(params);
      setLogs(data);
    } catch (error: any) {
      message.error(error.message || "Failed to fetch vehicle logs.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef, // Fixed: use contentRef for the latest API
    documentTitle: "Vehicle Logs Report",
  });

  const handleExportPDF = () => {
    if (!logs.length) {
      message.warning("No data to export.");
      return;
    }

    const doc = new jsPDF();

    // Add title
    doc.text("Vehicle Logs Report", 14, 15);

    // Add date range if available
    if (dateRange) {
      const [start, end] = dateRange;
      doc.text(
        `Period: ${start.format("YYYY-MM-DD")} to ${end.format("YYYY-MM-DD")}`,
        14,
        25
      );
    }

    autoTable(doc, {
      head: [
        [
          "Plate Number",
          "Type",
          "Registered",
          "Allowed",
          "Entry Time",
          "Exit Time",
          "Hours Spent",
        ],
      ],
      body: logs.map((log) => [
        log.plateNumber,
        log?.vehicleType ?? "",
        log.isRegistered ? "Registered" : "Not Registered",
        !log.isRegistered && log.isAllowed ? "Allowed" : "—",
        log.entryTime ? dayjs(log.entryTime).format("YYYY-MM-DD HH:mm A") : "—",
        log.exitTime ? dayjs(log.exitTime).format("YYYY-MM-DD HH:mm A") : "—",
        log.hoursSpent??0
      ]),
      startY: 35, // Start the table below the title and date range
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    doc.save("VehicleLogsReport.pdf");
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
          placeholder={["Start Date", "End Date"]}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={fetchData}
          loading={loading}
        >
          Search
        </Button>
        <Button
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          disabled={!logs.length}
        >
          Print
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExportPDF}
          disabled={!logs.length}
        >
          Export PDF
        </Button>
      </Space>

      <div ref={printRef} className="print-section">
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Vehicle Logs Report
        </h2>
        {dateRange && (
          <p style={{ textAlign: "center", marginBottom: 20 }}>
            Period: {dateRange[0].format("YYYY-MM-DD")} to{" "}
            {dateRange[1].format("YYYY-MM-DD")}
          </p>
        )}
        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          bordered
          pagination={false}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default VehicleLogsReport;
