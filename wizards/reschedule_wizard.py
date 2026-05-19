from markupsafe import Markup

from odoo import fields, models
from odoo.exceptions import UserError


class ClinicRescheduleWizard(models.TransientModel):
    _name = "clinic.reschedule.wizard"
    _description = "Clinic Reschedule Wizard"

    appointment_id = fields.Many2one(
        "clinic.appointment",
        string="Appointment",
        required=True,
    )
    new_date = fields.Datetime(
        string="New Scheduled Date and Time",
        required=True,
    )
    new_doctor_id = fields.Many2one(
        "clinic.doctor",
        string="New Doctor",
    )
    reason = fields.Text(
        string="Reason for Rescheduling",
    )

    def action_confirm_reschedule(self):
        for wizard in self:
            if wizard.new_date < fields.Datetime.now():
                raise UserError("The new appointment date cannot be in the past.")

            appointment = wizard.appointment_id
            old_date = appointment.appointment_date

            values = {
                "appointment_date": wizard.new_date,
            }
            if wizard.new_doctor_id:
                values["doctor_id"] = wizard.new_doctor_id.id

            appointment.write(values)
            appointment.message_post(
                body=Markup(
                    "<p>Appointment rescheduled.</p>"
                    "<ul>"
                    "<li><strong>Old Date:</strong> %s</li>"
                    "<li><strong>New Date:</strong> %s</li>"
                    "<li><strong>Reason:</strong> %s</li>"
                    "</ul>"
                ) % (
                    fields.Datetime.to_string(old_date),
                    fields.Datetime.to_string(wizard.new_date),
                    wizard.reason or "No reason provided.",
                )
            )

        return {"type": "ir.actions.act_window_close"}
