import React from "react";
import { z } from "zod";
import { athleteSchema } from "../../utils/validationSchemas";
import { Athlete } from "../../../types";
import { Modal, Input, Label, Select, Button } from "../../../components/UI";
import JalaliDatePicker from "./JalaliDatePicker";
import { generateId } from "../../../utils/helpers";

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
      joinDate: editingAthlete?.joinDate || new Date().toISOString().split("T")[0],
    });

    // State for validation errors
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // Validate the form data using Zod
      const validationResult = athleteSchema.safeParse({
        id:
          editingAthlete?.id ||
          generateId(),
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        gender: formData.gender as "Male" | "Female",
        joinDate: editingAthlete?.joinDate || formData.joinDate || new Date().toISOString(),
        measurements: editingAthlete?.measurements || [],
        currentGoal: formData.goal || undefined,
        status: (formData.status as "active" | "archived") || "active",
      });

      if (!validationResult.success) {
        // Extract and set validation errors
        const newErrors: Record<string, string> = {};
        validationResult.error.issues.forEach((issue) => {
          // Convert path to string to use as index
          const field =
            Array.isArray(issue.path) && issue.path.length > 0
              ? issue.path[0].toString()
              : "general";
          newErrors[field] = issue.message;
        });
        setErrors(newErrors);
        return;
      }

      // If validation passes, process the form data
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
          : generateId(),
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        gender: formData.gender as "Male" | "Female",
        joinDate: editingAthlete
          ? editingAthlete.joinDate
          : formData.joinDate || new Date().toISOString(),
        measurements: measurements,
        currentGoal: formData.goal || undefined,
        status: (formData.status as "active" | "archived") || "active",
      };
      onSubmit(athleteData);
      setErrors({}); // Clear errors after successful submission
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });

      // Clear the error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
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
              className={`font-bold ${errors.fullName ? "border-red-500" : ""}`}
              autoFocus
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>
          <div>
            <Label>شماره تماس</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`font-sans ${errors.phone ? "border-red-500" : ""}`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>سن</Label>
              <Input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                className={`text-center ${errors.age ? "border-red-500" : ""}`}
              />
              {errors.age && (
                <p className="text-red-500 text-sm mt-1">{errors.age}</p>
              )}
            </div>
            <div>
              <Label>قد (cm)</Label>
              <Input
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                className={`text-center ${
                  errors.height ? "border-red-500" : ""
                }`}
              />
              {errors.height && (
                <p className="text-red-500 text-sm mt-1">{errors.height}</p>
              )}
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
                className={`text-center ${
                  errors.weight ? "border-red-500" : ""
                }`}
              />
              {errors.weight && (
                <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
              )}
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
                className={`${errors.goal ? "border-red-500" : ""}`}
              />
              {errors.goal && (
                <p className="text-red-500 text-sm mt-1">{errors.goal}</p>
              )}
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
          {!editingAthlete && (
            <div>
              <Label>تاریخ عضویت</Label>
              <JalaliDatePicker
                value={formData.joinDate}
                onChange={(val) => setFormData({ ...formData, joinDate: val })}
                placeholder="انتخاب تاریخ عضویت"
              />
              {errors.joinDate && (
                <p className="text-red-500 text-sm mt-1">{errors.joinDate}</p>
              )}
            </div>
          )}
          <Button type="submit" className="w-full mt-4 h-12 text-base">
            {editingAthlete ? "ذخیره تغییرات" : "ثبت ورزشکار"}
          </Button>
        </form>
      </Modal>
    );
  }
);

export default AthleteModal;
