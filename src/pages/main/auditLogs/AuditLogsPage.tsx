import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  DatePicker,
  Table,
  Space,
  message,
  Select,
  Input,
} from "antd";
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
import { AuditLogs, AuditLogsDateRange } from "../../../types/AuditLogs";
import _auditLogsService from "../../../services/auditLogsService";
import { useQuery } from "@tanstack/react-query";
import _userService from "../../../services/userService";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditLogsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLogs[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [action, setAction] = useState<string>("");

  const printRef = useRef<HTMLDivElement>(null);

  const columns: ColumnsType<AuditLogs> = [
    {
      title: "Audit By",
      dataIndex: "auditName",
      key: "auditName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Date",
      dataIndex: "auditDate",
      key: "auditDate",
      render: (value?: Date) =>
        value ? dayjs(value).format("YYYY-MM-DD hh:mm A") : "—",
    },
  ];

  const {data:users}=useQuery({
    queryKey:["users"],
    queryFn:async()=>await _userService.getAllAsync(),
    initialData:[]
  })
  // Fetch users for dropdown
 

  const fetchData = async () => {
    if (!dateRange) {
      message.warning("Please select a date range.");
      return;
    }
    console.log(dateRange)

    const [start, end] = dateRange;
    const params: AuditLogsDateRange = {
      dateFrom: start.format("YYYY-MM-DD"),
      dateTo: end.format("YYYY-MM-DD"),
      auditBy: selectedUser ?? null,
      action: action || null,
    };

    console.log(params)
    try {
      setLoading(true);
      const data = await _auditLogsService.getAll(params);
      setLogs(data);
    } catch (error: any) {
      message.error(error.message || "Failed to fetch audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Audit Logs Report",
  });

  const handleExportPDF = () => {
    if (!logs.length) {
      message.warning("No data to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Audit Logs Report", 14, 15);

    if (dateRange) {
      const [start, end] = dateRange;
      doc.text(
        `Period: ${start.format("YYYY-MM-DD")} to ${end.format("YYYY-MM-DD")}`,
        14,
        25
      );
    }

    autoTable(doc, {
      head: [["Description", "Audit By", "Action", "Date"]],
      body: logs.map((log) => [
        log.description,
        log?.auditName ?? "",
        log.action ?? "",
        log.auditDate ?? "",
      ]),
      startY: 35,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    doc.save("AuditLogsReport.pdf");
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <RangePicker
          value={dateRange}
          onChange={(dates) => {
            setDateRange(dates as [Dayjs, Dayjs])}}
          placeholder={["Start Date", "End Date"]}
        />

        {/* User Dropdown */}
        <Select
          allowClear
          style={{ width: 180 }}
          placeholder="Select User"
          value={selectedUser ?? undefined}
          onChange={(value) => setSelectedUser(value)}
        >
          {users.map((user) => (
            <Option key={user.id} value={user.id}>
              {user.username}
            </Option>
          ))}
        </Select>

        {/* Action Input */}
        <Input
          placeholder="Filter by Action"
          style={{ width: 180 }}
          value={action}
          onChange={(e) => setAction(e.target.value)}
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
          Audit Logs Report
        </h2>
        {dateRange && (
          <p style={{ textAlign: "center", marginBottom: 20 }}>
            Period: {dateRange[0].format("YYYY-MM-DD")} to{" "}
            {dateRange[1].format("YYYY-MM-DD")}
          </p>
        )}
        <Table<AuditLogs>
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

export default AuditLogsPage;
