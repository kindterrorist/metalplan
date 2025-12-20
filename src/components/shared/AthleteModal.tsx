import React from "react";
import { Athlete } from "../../../types";
import { Modal, Input, Label, Select, Button } from "../../../components/UI";

interface AthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAthlete: Athlete | null;
  onSubmit: (athlete: Athlete) => void;
}

const AthleteModal: React.FC<AthleteModalProps> = React.memo(
  ({ isOpen, onClose, editingAthlete, onSubmit }) => {
    const [formData, setFormData] = React.useState({
      fullName: editingAthlete?.fullName || "",
      phone: editingAthlete?.phone || "",
      age: editingAthlete?.age?.toString() || "",
      height: editingAthlete?.height?.toString() || "",
      gender: editingAthlete?.gender || "Male",
      weight:
        editingAthlete?.measurements?.[
          editingAthlete.measurements.length - 1
        ]?.weight?.toString() || "",
      goal: editingAthlete?.currentGoal || "",
      status: editingAthlete?.status || "active",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const weightVal = parseFloat(formData.weight);
      let measurements = editingAthlete?.measurements
        ? [...editingAthlete.measurements]
        : [];
      if (measurements.length === 0 && !isNaN(weightVal)) {
        measurements.push({
          date: new Date().toISOString(),
          weight: weightVal,
        });
      } else if (measurements.length > 0 && !isNaN(weightVal)) {
        const last = measurements[measurements.length - 1];
        if (last.weight !== weightVal) {
          measurements.push({
            date: new Date().toISOString(),
            weight: weightVal,
          });
        }
      }

      const athleteData: Athlete = {
        id: editingAthlete
          ? editingAthlete.id
          : crypto.randomUUID
          ? crypto.randomUUID()
          : `athlete-${Date.now()}`,
        fullName: formData.fullName,
        phone: formData.phone,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        gender: formData.gender as "Male" | "Female",
        joinDate: editingAthlete
          ? editingAthlete.joinDate
          : new Date().toISOString(),
        measurements: measurements,
        currentGoal: formData.goal,
        status: formData.status as "active" | "archived",
      };
      onSubmit(athleteData);
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingAthlete ? "ویرایش ورزشکار" : "افزودن ورزشکار"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>نام کامل</Label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="font-bold"
              autoFocus
            />
          </div>
          <div>
            <Label>شماره تماس</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="font-sans"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>سن</Label>
              <Input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
                className="text-center"
              />
            </div>
            <div>
              <Label>قد (cm)</Label>
              <Input
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                required
                className="text-center"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>جنسیت</Label>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">آقا</option>
                <option value="Female">خانم</option>
              </Select>
            </div>
            <div>
              <Label>وزن (kg)</Label>
              <Input
                name="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                required
                className="text-center"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>هدف تمرینی</Label>
              <Input
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                placeholder="مثلا: کاهش وزن"
              />
            </div>
            <div>
              <Label>وضعیت</Label>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">فعال</option>
                <option value="archived">بایگانی شده</option>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full mt-4 h-12 text-base">
            {editingAthlete ? "ذخیره تغییرات" : "ثبت ورزشکار"}
          </Button>
        </form>
      </Modal>
    );
  }
);

export default AthleteModal;
