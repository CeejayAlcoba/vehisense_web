import { useEffect, useState } from "react";
import { Card, Tooltip, Modal, Form, Input, message } from "antd";
import {
  CarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ExportOutlined,
  StopOutlined,
  CheckOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import Table from "../../../components/table/Table";
import TextColor from "../../../components/text/TextColor";
import _blacklistedVehiclesService from "../../../services/blacklistedVehiclesService";

import { getColumns } from "./MonitoringPage";
import {
  formatTo12Hour,
  getCurrentDateYMD,
} from "../../../utils/dateTimeUtility";
import { REFETCH_INTERVAL } from "../../../configs/request.config";

import utc from "dayjs/plugin/utc";
import { OverDueDTO } from "../../../types/OverDueDTO";
import { BlacklistedVehicles } from "../../../types/BlacklistedVehicles";
import Toast from "../../../components/toast/Toast";
import dayjs from "dayjs";
import _vehicleLogsService from "../../../services/VehicleLogsService";
import { WarningList } from "../../../types/WarningList";
import _warningListService from "../../../services/warningListService";
dayjs.extend(utc);

export default function MonitoringCards() {
  const dateToday = getCurrentDateYMD();
  const [form] = Form.useForm();
  const [allowForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllowModalOpen, setIsAllowModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OverDueDTO | null>(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningForm] = Form.useForm();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);
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

  const entranceColumns = (data: any) => [
    ...getColumns(data),
    {
      title: "Hours Spent",
      dataIndex: "hoursSpent",
      key: "hoursSpent",
      render: (value: number, record: OverDueDTO) => (
        <TextColor
          isDanger={!record.isRegistered && !record.isAllowed}
          isWarning={record.isInWarningList}
        >
          {value}
        </TextColor>
      ),
    },
    {
      title: "Time Spent",
      key: "liveTime",
      render: (_: any, record: OverDueDTO) => {
        if (!record.entryTime) return "-";

        const entry = dayjs.utc(record.entryTime).local();
        const end = record.exitTime
          ? dayjs.utc(record.exitTime).local()
          : dayjs();

        const seconds = end.diff(entry, "second");

        const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
        const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
        const ss = String(seconds % 60).padStart(2, "0");

        return (
          <TextColor
            isDanger={!record.isRegistered && !record.isAllowed}
          >{`${hh}:${mm}:${ss}`}</TextColor>
        );
      },
    },
  ];
  const activeColumns = (data: any) => [
    ...getColumns(data),
    {
      title: "Time Spent",
      key: "liveTime",
      render: (_: any, record: OverDueDTO) => {
        if (!record.entryTime) return "-";

        const entry = dayjs.utc(record.entryTime).local();
        const end = record.exitTime
          ? dayjs.utc(record.exitTime).local()
          : dayjs();

        const seconds = end.diff(entry, "second");

        const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
        const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
        const ss = String(seconds % 60).padStart(2, "0");

        return (
          <TextColor
            isDanger={!record.isRegistered && !record.isAllowed}
            isWarning={record.isInWarningList}
          >
            {`${hh}:${mm}:${ss}`}
          </TextColor>
        );
      },
    },
  ];
  const exitColumns = (data: any) => [
    ...getColumns(data),
    {
      title: "Exit Time",
      dataIndex: "exitTime",
      key: "exitTime",
      render: (text: any, record: any) => (
        <TextColor
          isDanger={!record.isRegistered && !record.isAllowed}
          isWarning={record.isInWarningList}
        >
          {formatTo12Hour(text)}
        </TextColor>
      ),
    },
  ];

  const overDueColumns = (data: OverDueDTO[]) => [
    ...getColumns(data),
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_: any, record: OverDueDTO) => (
        <>
          <Tooltip title="Add to Blacklisted">
            <StopOutlined
              style={{ color: "red", fontSize: 18, cursor: "pointer" }}
              onClick={() => {
                setSelectedRecord(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Allow Entrance">
            <CheckOutlined
              className="text-primary"
              style={{ fontSize: 18, cursor: "pointer" }}
              onClick={() => {
                setSelectedRecord(record);
                setIsAllowModalOpen(true);
              }}
            />
          </Tooltip>
          {!record.isInWarningList && (
            <Tooltip title="Add to Warning">
              <WarningOutlined
                style={{ color: "orange", fontSize: 18, cursor: "pointer" }}
                onClick={() => {
                  setSelectedRecord(record);
                  setIsWarningModalOpen(true);
                }}
              />
            </Tooltip>
          )}
        </>
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
      await _warningListService.deleteByPlateNumber(selectedRecord.plateNumber);
      Toast("Vehicle has been blacklisted.");
      form.resetFields();
      setIsModalOpen(false);
    } catch (err) {
      Toast("Blacklist failed:", { type: "error" });
    }
  };

  const handleWarning = async () => {
    try {
      const values = await warningForm.validateFields();
      if (!selectedRecord) return;

      const payload: WarningList = {
        vehicleLogsId: selectedRecord.id,
        plateNumber: selectedRecord.plateNumber,
        note: values.note,
      };
      await _warningListService.insertAsync(payload);
      Toast("Vehicle has been added to Warning List.");
      warningForm.resetFields();
      setIsWarningModalOpen(false);
    } catch (err) {
      console.log(err);
      Toast("Warning add failed", { type: "error" });
    }
  };

  const handleAllowVehicle = async () => {
    try {
      const values = await allowForm.validateFields();
      if (!selectedRecord) return;

      const payload: OverDueDTO = {
        ...selectedRecord,
        isAllowed: true,
        remarks: values.remarks,
        allowedHourLimit: values.allowedHourLimit,
        allowedDateTime: new Date().toISOString(),
      };
      console.log(payload);
      await _vehicleLogsService.updateAsync(selectedRecord.id ?? 0, payload);
      Toast("Vehicle has been allowed to entrance.");
      allowForm.resetFields();
      setIsAllowModalOpen(false);
    } catch (err) {
      console.log(err);
      Toast("Blacklist failed:", { type: "error" });
    }
  };

  return (
    <>
      <Modal
        title={
          <>
            Add to Blacklisted: Plate No.{" "}
            <strong>{selectedRecord?.plateNumber}</strong> -{" "}
            {selectedRecord?.vehicleType}
          </>
        }
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
      <Modal
        title={
          <>
            Allow vehicle to enter: Plate No.{" "}
            <strong>{selectedRecord?.plateNumber}</strong> -{" "}
            {selectedRecord?.vehicleType}
          </>
        }
        open={isAllowModalOpen}
        onOk={handleAllowVehicle}
        okButtonProps={{ htmlType: "submit" }}
        onCancel={() => {
          allowForm.resetFields();
          setIsAllowModalOpen(false);
        }}
        okText="Allow"
      >
        <Form layout="vertical" form={allowForm}>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea
              rows={3}
              placeholder="Enter remarks for allowing vehicle"
            />
          </Form.Item>
          <Form.Item
            name="allowedHourLimit"
            label="Number of Hours"
            rules={[
              { required: true, message: "Please enter the number of hours" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || (Number(value) >= 0 && Number(value) <= 24)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Hours must be between 0 and 24")
                  );
                },
              }),
            ]}
          >
            <Input
              type="number"
              min={0}
              max={24}
              placeholder="Enter number of hours of allowing vehicle"
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
              columns={entranceColumns(entries)}
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
              columns={activeColumns(actives)}
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
      <Modal
        title={
          <>
            Add to Warning List: Plate No.{" "}
            <strong>{selectedRecord?.plateNumber}</strong> -{" "}
            {selectedRecord?.vehicleType}
          </>
        }
        open={isWarningModalOpen}
        onOk={handleWarning}
        onCancel={() => {
          warningForm.resetFields();
          setIsWarningModalOpen(false);
        }}
        okText="Add to Warning"
      >
        <Form form={warningForm} layout="vertical">
          <Form.Item
            name="note"
            label="Note"
            rules={[{ required: true, message: "Please input the note" }]}
          >
            <Input.TextArea rows={3} placeholder="Enter warning note" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
