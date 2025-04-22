import { useState } from "react";
import { Card, Tooltip, Modal, Form, Input, message } from "antd";
import {
  CarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ExportOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";

import Table from "../../../components/table/Table";
import TextColor from "../../../components/text/TextColor";
import _vehicleLogsService from "../../../services/VehicleLogsService";
import _blacklistedVehiclesService from "../../../services/blacklistedVehiclesService";

import { getColumns } from "./MonitoringPage";
import {
  formatTo12Hour,
  getCurrentDateYMD,
} from "../../../utils/dateTimeUtility";
import { REFETCH_INTERVAL } from "../../../configs/request.config";

import { VehicleLogs } from "../../../types/VehicleLogs";
import { BlacklistedVehicles } from "../../../types/BlacklistedVehicles";
import Toast from "../../../components/toast/Toast";

export default function MonitoringCards() {
  const dateToday = getCurrentDateYMD();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VehicleLogs | null>(
    null
  );

  const { data } = useQuery({
    queryKey: ["data"],
    queryFn: async () => {
      const entries = await _vehicleLogsService.getAllAsync({
        dateFrom: dateToday,
      });
      const actives = await _vehicleLogsService.GetActiveEntries({
        dateFrom: dateToday,
      });
      const exits = await _vehicleLogsService.GetExit({ dateFrom: dateToday });
      const overDues = await _vehicleLogsService.GetUnregisterOverDues();
      return { entries, actives, exits, overDues };
    },
    initialData: {
      entries: [],
      actives: [],
      exits: [],
      overDues: [],
    },
    refetchInterval: REFETCH_INTERVAL,
  });

  const { entries, actives, exits, overDues } = data;

  const exitColumns = (data: any) => [
    ...getColumns(data),
    {
      title: "Exit Time",
      dataIndex: "exitTime",
      key: "exitTime",
      render: (text: any, record: any) => (
        <TextColor isDanger={!record.isRegistered}>
          {formatTo12Hour(text)}
        </TextColor>
      ),
    },
  ];

  const overDueColumns = (data: VehicleLogs[]) => [
    ...getColumns(data),
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_: any, record: VehicleLogs) => (
        <Tooltip title="Add to Blacklisted">
          <StopOutlined
            style={{ color: "red", fontSize: 18, cursor: "pointer" }}
            onClick={() => {
              setSelectedRecord(record);
              setIsModalOpen(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  const handleBlacklist = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedRecord) return;

      const payload: BlacklistedVehicles = {
        vehiclePlate: selectedRecord.plateNumber,
        reason: values.reason,
      };

      await _blacklistedVehiclesService.insertAsync(payload);
      Toast("Vehicle has been blacklisted.");
      form.resetFields();
      setIsModalOpen(false);
    } catch (err) {
      Toast("Blacklist failed:", { type: "error" });
    }
  };

  return (
    <>
      <Modal
        title={<>Add to Blacklisted: Plate No. <strong>{selectedRecord?.plateNumber}</strong> - {selectedRecord?.vehicleType}</>}
        open={isModalOpen}
        onOk={handleBlacklist}
        onCancel={() => {
          form.resetFields();
          setIsModalOpen(false);
        }}
        okText="Blacklist"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: "Please input the reason" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter reason for blacklisting"
            />
          </Form.Item>
        </Form>
      </Modal>

      <div className="row gap-3">
        <div className="col-xl-5">
          <Card
            title={
              <span>
                <CarOutlined style={{ marginRight: 8 }} />
                Vehicle Entries ({entries.length})
              </span>
            }
          >
            <Table
              columns={getColumns(entries)}
              dataSource={entries}
              virtual
              pagination={false}
              scroll={{ x: 200, y: 200 }}
            />
          </Card>
        </div>

        <div className="col-xl-6">
          <Card
            title={
              <span>
                <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                Unregistered Vehicle and Overdue Time ({overDues.length})
              </span>
            }
          >
            <Table
              columns={overDueColumns(overDues)}
              dataSource={overDues}
              virtual
              pagination={false}
              scroll={{ x: 200, y: 200 }}
            />
          </Card>
        </div>

        <div className="col-xl-5">
          <Card
            title={
              <span>
                <CheckCircleOutlined style={{ marginRight: 8 }} />
                Active Vehicles ({actives.length})
              </span>
            }
          >
            <Table
              columns={getColumns(actives)}
              dataSource={actives}
              virtual
              pagination={false}
              scroll={{ x: 200, y: 200 }}
            />
          </Card>
        </div>

        <div className="col-xl-6">
          <Card
            title={
              <span>
                <ExportOutlined style={{ marginRight: 8 }} />
                Vehicle Exits ({exits.length})
              </span>
            }
          >
            <Table
              columns={exitColumns(exits)}
              dataSource={exits}
              virtual
              pagination={false}
              scroll={{ x: 200, y: 200 }}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
