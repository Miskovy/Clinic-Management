from odoo import models, fields, api , exceptions


class ClinicPatient(models.Model):
    _name = "clinic.patient"
    _description = "Clinic Patient"
    _rec_name = "name"

    name = fields.Char(string="Patient Full Name", required=True)
    age = fields.Integer(string="Patient Age")
    gender = fields.Selection(
        [
            ("male", "Male"),
            ("female", "Female"),
            ("other", "Other"),
        ],
        string="Patient Gender",
    )
    phone = fields.Char(string="Contact Phone Number")
    email = fields.Char(string="Email Address")
    address = fields.Text(string="Full Home Address")
    active = fields.Boolean(string="Active", default=True)
    notes = fields.Text(string="Internal notes about the patient")
    state = fields.Selection(
        [
            ("new", "New"),
            ("active", "Active"),
            ("discharged", "Discharged"),
        ],
        string="State",
        default="new",
    )
    doctor_id = fields.Many2one("clinic.doctor", string="Assigned Doctor", ondelete="set null")
    birth_date = fields.Date(string="Birth Date")
    age_computed = fields.Integer(string="Computed Age", compute="_compute_age", store=True)
    display_info = fields.Char(string="Display Info", compute="_compute_display_info", store=False)
    appointment_ids = fields.One2many("clinic.appointment", "patient_id", string="Appointments")
    

    @api.depends('name', 'gender', 'age_computed')
    def _compute_display_info(self):
        gender_labels = {'male': 'Male', 'female': 'Female', 'other': 'Other'}
        for record in self:
            name = record.name or ''
            gender = gender_labels.get(record.gender, '')
            age = record.age_computed or 0
            record.display_info = f"{name} | {gender} | {age} yrs"

    @api.depends('birth_date')
    def _compute_age(self):
        today = fields.Date.today()
        for record in self:
            if record.birth_date:
                age = today.year - record.birth_date.year
                if (today.month, today.day) < (record.birth_date.month, record.birth_date.day):
                    age -= 1
                record.age_computed = age
            else:
                record.age_computed = 0

    @api.constrains('age')
    def _check_age(self):
        for record in self:
            if record.age < 0 or record.age > 150:
                raise exceptions.ValidationError("Patient age must be between 0 and 150")


    @api.constrains('phone', 'email')
    def _check_phone_or_email(self):
        for record in self:
            if not record.phone and not record.email:
                raise exceptions.ValidationError("At least one of Phone or Email must be filled.")
