import React, { useRef, useState, useEffect } from "react";
import { Button, DatePicker, Table, Space, message, Tag, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined, PrinterOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useReactToPrint } from "react-to-print";
import _vehicleLogsService from "../../../services/vehicleLogsService";
import { VehicleLogs, VehicleLogsDateRange, VehicleLogsWithHourSpent } from "../../../types/VehicleLogs";

const { RangePicker } = DatePicker;

const VehicleLogsReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<VehicleLogsWithHourSpent[]>([]);
  const [plateNumber, setPlateNumber] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const columns: ColumnsType<VehicleLogsWithHourSpent> = [
    { title: "Plate Number", dataIndex: "plateNumber", key: "plateNumber" },
    { title: "Type", dataIndex: "vehicleType", key: "vehicleType" },
    {
      title: "Registered",
      dataIndex: "isRegistered",
      key: "isRegistered",
      render: (value: boolean) => (value ? <Tag color="green">Registered</Tag> : <Tag color="red">Not Registered</Tag>),
    },
    {
      title: "Allowed",
      key: "isAllowed",
      render: (_, record) => (!record.isRegistered && record.isAllowed ? <Tag color="blue">Allowed</Tag> : <Tag color="default">—</Tag>),
    },
    {
      title: "Entry Time",
      dataIndex: "entryTime",
      key: "entryTime",
      render: (value?: Date) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "—"),
    },
    {
      title: "Exit Time",
      dataIndex: "exitTime",
      key: "exitTime",
      render: (value?: Date) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "—"),
    },
    { 
      title: "Hours Spent", 
      dataIndex: "hoursSpent", 
      key: "hoursSpent",
      render: (value?: number) => {
        if (!value) return "00:00:00";
        const hours = Math.floor(value);
        const minutes = Math.floor((value - hours) * 60);
        const seconds = Math.floor(((value - hours) * 60 - minutes) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    },
  ];

  // Fetch all logs on mount
  const fetchAllLogs = async () => {
    try {
      setLoading(true);
      const data = await _vehicleLogsService.getAllAsync({});
      setLogs(data);
    } catch (error: any) {
      message.error(error.message || "Failed to fetch vehicle logs.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs filtered by date range and/or plate number
  const fetchFilteredLogs = async () => {
    if (!dateRange && !plateNumber) {
      // If both are empty, fetch all logs
      fetchAllLogs();
      return;
    }

    const params: VehicleLogsDateRange = {
      ...(dateRange && {
        dateFrom: dateRange[0].format("YYYY-MM-DD"),
        dateTo: dateRange[1].format("YYYY-MM-DD"),
      }),
      plateNumber: plateNumber || undefined,
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

  useEffect(() => {
    fetchAllLogs();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Vehicle Logs Report",
  });

  const handleExportPDF = () => {
    if (!logs.length) {
      message.warning("No data to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Vehicle Logs Report", 14, 15);

    if (dateRange) {
      const [start, end] = dateRange;
      doc.text(`Period: ${start.format("YYYY-MM-DD")} to ${end.format("YYYY-MM-DD")}`, 14, 25);
    }

    autoTable(doc, {
      head: [["Plate Number", "Type", "Registered", "Allowed", "Entry Time", "Exit Time", "Hours Spent"]],
      body: logs.map(log => {
        const hoursSpent = log.hoursSpent ?? 0;
        const hours = Math.floor(hoursSpent);
        const minutes = Math.floor((hoursSpent - hours) * 60);
        const seconds = Math.floor(((hoursSpent - hours) * 60 - minutes) * 60);
        const timeSpent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        return [
          log.plateNumber,
          log.vehicleType ?? "",
          log.isRegistered ? "Registered" : "Not Registered",
          !log.isRegistered && log.isAllowed ? "Allowed" : "—",
          log.entryTime ? dayjs(log.entryTime).format("YYYY-MM-DD HH:mm:ss") : "—",
          log.exitTime ? dayjs(log.exitTime).format("YYYY-MM-DD HH:mm:ss") : "—",
          timeSpent,
        ];
      }),
      startY: 35,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: "bold" },
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
        <Input
          placeholder="Plate Number"
          onChange={(e) => setPlateNumber(e.target.value)}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={fetchFilteredLogs} loading={loading}>
          Search
        </Button>
        <Button icon={<PrinterOutlined />} onClick={handlePrint} disabled={!logs.length}>
          Print
        </Button>
        <Button icon={<DownloadOutlined />} onClick={handleExportPDF} disabled={!logs.length}>
          Export PDF
        </Button>
      </Space>

      <div ref={printRef} className="print-section">
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Vehicle Logs Report</h2>
        {dateRange && (
          <p style={{ textAlign: "center", marginBottom: 20 }}>
            Period: {dateRange[0].format("YYYY-MM-DD")} to {dateRange[1].format("YYYY-MM-DD")}
          </p>
        )}
        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          bordered
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default VehicleLogsReport;