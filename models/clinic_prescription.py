from odoo import fields, models

class ClinicPrescription(models.Model):
    _name = 'clinic.prescription'
    _description = 'Clinic Prescription'

    appointment_id = fields.Many2one('clinic.appointment',required=True,ondelete='cascade')
    product_id = fields.Many2one('product.product',required=True, string='Medicine')
    quantity = fields.Integer(string='Quantity', default=1)
    dose = fields.Char(string='Dosage instructions')
    duration_days = fields.Integer(string='Number of days for this Prescription')
    notes = fields.Text(string='Additional Notes')


