from odoo import models, fields

class ClinicProducts(models.Model):
    _inherit = 'product.template'

    is_medicine = fields.Boolean('Medicine')
