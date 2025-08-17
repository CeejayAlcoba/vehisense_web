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
import { AuditLogs, AuditLogsDateRange } from "../../../types/AuditLogs";
import _auditLogsService from "../../../services/auditLogsService";

const { RangePicker } = DatePicker;

const AuditLogsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLogs[]>([]);

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
      title: "Date",
      dataIndex: "auditDate",
      key: "auditDate",
      render: (value?: Date) =>
      value ? dayjs(value).format("YYYY-MM-DD hh:mm A") : "—"
    }
  ];

  const fetchData = async () => {
    if (!dateRange) {
      message.warning("Please select a date range.");
      return;
    }

    const [start, end] = dateRange;
    const params: AuditLogsDateRange = {
      dateFrom: start.format("YYYY-MM-DD"),
      dateTo: end.format("YYYY-MM-DD"),
    };

    try {
      setLoading(true);
      const data = await _auditLogsService.getAllAsync(params);
      setLogs(data);
    } catch (error: any) {
      message.error(error.message || "Failed to fetch audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef, // Fixed: use contentRef for the latest API
    documentTitle: "Audit Logs Report",
  });

  const handleExportPDF = () => {
    if (!logs.length) {
      message.warning("No data to export.");
      return;
    }

    const doc = new jsPDF();

    // Add title
    doc.text("Audit Logs Report", 14, 15);

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
          "Description",
          "Audit By",
          "Date"
        ],
      ],
      body: logs.map((log) => [
        log.description,
        log?.auditName ?? "",
        log.auditDate??"",
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

    doc.save("AuditLogsReport.pdf");
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
