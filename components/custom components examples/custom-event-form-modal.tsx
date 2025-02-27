const MyCustomForm: React.FC<{ register: any; errors: any }> = ({
  register,
  errors,
}) => (
  <>
    <input
      {...register("title")}
      placeholder="Custom Event Name"
      className={`input ${errors.title ? "input-error" : ""}`}
    />
    {errors.title && (
      <span className="error-message">{errors.title.message}</span>
    )}

    <textarea
      {...register("description")}
      placeholder="Custom Description"
      className="textarea"
    />

    <input
      {...register("startDate")}
      type="date"
      className={`input ${errors.startDate ? "input-error" : ""}`}
    />

    <input
      {...register("endDate")}
      type="date"
      className={`input ${errors.endDate ? "input-error" : ""}`}
    />

    {/* New Select Field for Available Schedule */}
    <select
      {...register("schedule")}
      className={`input ${errors.schedule ? "input-error" : ""}`}
    >
      <option value="">Select Schedule</option>
      <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
      <option value="afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
      <option value="evening">Evening (6:00 PM - 10:00 PM)</option>
    </select>
    {errors.schedule && (
      <span className="error-message">{errors.schedule.message}</span>
    )}

    <button type="submit" className="btn">
      Submit
    </button>
  </>
);
