from odoo import models, fields, api, exceptions


class ClinicDoctor(models.Model):
    _name = "clinic.doctor"
    _description = "Clinic Doctor"
    _rec_name = "name"

    name = fields.Char(string="Doctor Full Name", required=True)
    specialization =  fields.Selection(
        [
            ("general", "General"),
            ("cardiology", "Cardiology"),
            ("pediatrics", "Pediatrics"),
            ("neurology", "Neurology"),
            ("orthopedics", "Orthopedics"),
        ],
        string="Specialization",
        required=True,
        default="general",
    )

    phone = fields.Char(string="Contact Phone Number")
    email = fields.Char(string="Email Address")
    active = fields.Boolean(string="Active", default=True)
    patient_ids = fields.One2many("clinic.patient", "doctor_id", string="Patients")
    appointment_count = fields.Integer(string="Number of Appointments", compute="_compute_appointment_count", store=True)
    appointment_ids = fields.One2many("clinic.appointment", "doctor_id", string="Appointments")

    @api.depends("patient_ids")
    def _compute_appointment_count(self):
        for record in self:
            record.appointment_count = len(record.patient_ids)

    def action_view_patients(self):
        return {
            'type': 'ir.actions.act_window',
            'name': 'Patients',
            'res_model': 'clinic.patient',
            'view_mode': 'tree,form',
            'domain': [('doctor_id', '=', self.id)],
        }
