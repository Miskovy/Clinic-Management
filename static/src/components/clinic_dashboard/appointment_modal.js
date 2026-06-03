/** @odoo-module **/
import { Component, useState, onMounted } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class AppointmentModal extends Component {
    setup() {
        this.rpc = useService("rpc");
        this.state = useState({
            patientId: "",
            doctorId: "",
            appointmentDate: "",
            reason: "",
            patients: [],
            doctors: [],
            isSubmitting: false,
            errors: {
                patient: "",
                doctor: "",
                date: "",
            },
        });

        onMounted(() => {
            this.loadFormData();
        });
    }

    async loadFormData() {
        try {
            const [patients, doctors] = await Promise.all([
                this.rpc("/web/dataset/call_kw/clinic.patient/search_read", {
                    model: "clinic.patient",
                    method: "search_read",
                    args: [],
                    kwargs: {
                        domain: [],
                        fields: ["name"],
                    },
                }),
                this.rpc("/web/dataset/call_kw/clinic.doctor/search_read", {
                    model: "clinic.doctor",
                    method: "search_read",
                    args: [],
                    kwargs: {
                        domain: [],
                        fields: ["name"],
                    },
                }),
            ]);
            this.state.patients = patients;
            this.state.doctors = doctors;
        } catch (error) {
            console.error("Failed to load lookup data:", error);
        }
    }

    async onSubmit(ev) {
        ev.preventDefault();

        // Reset errors
        this.state.errors.patient = "";
        this.state.errors.doctor = "";
        this.state.errors.date = "";

        let isValid = true;
        if (!this.state.patientId) {
            this.state.errors.patient = "Patient is required.";
            isValid = false;
        }
        if (!this.state.doctorId) {
            this.state.errors.doctor = "Doctor is required.";
            isValid = false;
        }
        if (!this.state.appointmentDate) {
            this.state.errors.date = "Appointment date is required.";
            isValid = false;
        }

        if (!isValid) return;

        this.state.isSubmitting = true;
        
        try {
            const selectedDoctor = this.state.doctors.find(d => d.id === parseInt(this.state.doctorId));
            const doctorName = selectedDoctor ? selectedDoctor.name : "Appointment";
            const name = `Appointment - ${doctorName}`;

            await this.rpc("/web/dataset/call_kw/clinic.appointment/create", {
                model: "clinic.appointment",
                method: "create",
                args: [[{
                    name: name,
                    patient_id: parseInt(this.state.patientId),
                    doctor_id: parseInt(this.state.doctorId),
                    appointment_date: `${this.state.appointmentDate} 10:00:00`,
                    reason: this.state.reason,
                    state: "draft",
                }]],
                kwargs: {},
            });

            // Signal parent that a new appointment was created
            if (this.props.onAppointmentCreated) {
                this.props.onAppointmentCreated();
            }
            if (this.props.onClose) {
                this.props.onClose();
            }
        } catch (error) {
            console.error("Failed to create appointment:", error);
        } finally {
            this.state.isSubmitting = false;
        }
    }
}

AppointmentModal.template = "clinic_management.AppointmentModal";
