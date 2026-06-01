/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, onMounted, useState } from "@odoo/owl";

export class ClinicDashboard extends Component {
    setup() {
        this.orm = useService("orm");
        this.state = useState({
            title: "Clinic Dashboard",
            isLoading: true,
            error: null,
            patientCount: 0,
            totalAppointments: 0,
            confirmedAppointments: 0,
            doneAppointments: 0,
            cancelledAppointments: 0,
            recentAppointments: [],
            confirmingAppointmentId: null,
        });

        onMounted(() => {
            this.loadDashboardData();
        });
    }

    async loadDashboardData() {
        this.state.isLoading = true;
        this.state.error = null;

        try {
            const [
                patientCount,
                totalAppointments,
                confirmedAppointments,
                doneAppointments,
                cancelledAppointments,
                recentAppointments,
            ] = await Promise.all([
                this.orm.searchCount("clinic.patient", []),
                this.orm.searchCount("clinic.appointment", []),
                this.orm.searchCount("clinic.appointment", [["state", "=", "confirmed"]]),
                this.orm.searchCount("clinic.appointment", [["state", "=", "done"]]),
                this.orm.searchCount("clinic.appointment", [["state", "=", "cancelled"]]),
                this.orm.searchRead(
                    "clinic.appointment",
                    [],
                    ["name", "patient_id", "doctor_id", "appointment_date", "state"],
                    { limit: 5, order: "appointment_date desc" }
                ),
            ]);

            this.state.patientCount = patientCount;
            this.state.totalAppointments = totalAppointments;
            this.state.confirmedAppointments = confirmedAppointments;
            this.state.doneAppointments = doneAppointments;
            this.state.cancelledAppointments = cancelledAppointments;
            this.state.recentAppointments = recentAppointments;
        } catch (error) {
            console.error("Failed to load clinic dashboard data", error);
            this.state.error = "Could not load dashboard data.";
        } finally {
            this.state.isLoading = false;
        }
    }

    async confirmAppointment(appointmentId) {
        this.state.confirmingAppointmentId = appointmentId;
        this.state.error = null;

        try {
            await this.orm.call("clinic.appointment", "action_confirm", [[appointmentId]]);
            await this.loadDashboardData();
        } catch (error) {
            console.error("Failed to confirm clinic appointment", error);
            this.state.error = "Could not confirm the appointment.";
        } finally {
            this.state.confirmingAppointmentId = null;
        }
    }
}

ClinicDashboard.template = "clinic_management.ClinicDashboard";

registry.category("actions").add("clinic_dashboard", ClinicDashboard);
