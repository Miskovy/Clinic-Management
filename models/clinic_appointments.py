from odoo import models, fields, api, exceptions


class ClinicAppointment(models.Model):
    _name = "clinic.appointment"
    _description = "Clinic Appointment"
    _rec_name = "name"

    name = fields.Char(string="Name", required=True)
    patient_id = fields.Many2one("clinic.patient", string="Patient", required=True)
    doctor_id = fields.Many2one("clinic.doctor", string="Doctor", required=True)
    appointment_date = fields.Datetime(string="Appointment Date", required=True)
    reason = fields.Text(string="Reason for the visit")
    diagnosis = fields.Text(string="Doctor Notes and Diagnosis")
    state = fields.Selection([
        ("draft", "Draft"),
        ("confirmed", "Confirmed"),
        ("done", "Done"),
        ("cancelled", "Cancelled"),
    ], string="State", default="draft")

    @api.onchange('doctor_id')
    def _onchange_doctor_id(self):
        if self.doctor_id:
            self.name = self.doctor_id.name

    @api.constrains('appointment_date')
    def _check_appointment_date_not_past(self):
        for record in self:
            if record.appointment_date and record.appointment_date < fields.Datetime.now():
                raise exceptions.ValidationError("Appointment date cannot be in the past")

    @api.constrains('patient_id', 'appointment_date')
    def _check_duplicate_appointment(self):
        for record in self:
            if record.patient_id and record.appointment_date:
                same_day = self.search([
                    ('patient_id', '=', record.patient_id.id),
                    ('appointment_date', '=', record.appointment_date),
                    ('id', '!=', record.id),
                ])
                if same_day:
                    raise exceptions.ValidationError(
                        "This patient already has an appointment at the same time."
                    )

    def action_confirm(self):
        for record in self:
            record.state = "confirmed"

    def action_cancel(self):
        for record in self:
            record.state = "cancelled"

    def action_done(self):
        for record in self:
            record.state = "done"
