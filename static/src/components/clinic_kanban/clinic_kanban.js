/** @odoo-module **/
import { Component, onMounted, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { deserializeDateTime, formatDateTime } from "@web/core/l10n/dates";
import { registry } from "@web/core/registry";

export class ClinicKanban extends Component {
    setup() {
        this.rpc = useService("rpc");
        this.state = useState({
            searchQuery: "",
            draft: [],
            confirmed: [],
            done: [],
            cancelled: [],
        });

        onMounted(() => {
            this.loadAppointments();
        });
    }

    formatDate(dateStr) {
        if (!dateStr) return "";
        return formatDateTime(deserializeDateTime(dateStr));
    }

    filterByPatient(appointments) {
        const query = this.state.searchQuery.toLowerCase().trim();
        if (!query) {
            return appointments;
        }
        return appointments.filter(appt => {
            const patientName = appt.patient_id ? appt.patient_id[1] : "";
            return patientName.toLowerCase().includes(query);
        });
    }

    get draft() {
        return this.filterByPatient(this.state.draft);
    }

    get confirmed() {
        return this.filterByPatient(this.state.confirmed);
    }

    get done() {
        return this.filterByPatient(this.state.done);
    }

    get cancelled() {
        return this.filterByPatient(this.state.cancelled);
    }

    async moveForward(appt) {
        const method = appt.state === "draft" ? "action_confirm" : "action_done";
        try {
            await this.rpc(`/web/dataset/call_kw/clinic.appointment/${method}`, {
                model: "clinic.appointment",
                method: method,
                args: [[appt.id]],
                kwargs: {},
            });
            await this.loadAppointments();
        } catch (error) {
            console.error(`Failed to move appointment forward via ${method}:`, error);
        }
    }

    async loadAppointments() {
        const modelname = "clinic.appointment";
        const domain = [];
        const fields = ["name", "patient_id", "doctor_id", "appointment_date", "state"];

        try {
            const appointments = await this.rpc(`/web/dataset/call_kw/${modelname}/search_read`, {
                model: modelname,
                method: "search_read",
                args: [],
                kwargs: {
                    domain: domain,
                    fields: fields,
                },
            });

            this.state.draft = [];
            this.state.confirmed = [];
            this.state.done = [];
            this.state.cancelled = [];

            for (const appt of appointments) {
                appt.formatted_date = appt.appointment_date ? this.formatDate(appt.appointment_date) : "";
                if (appt.state in this.state) {
                    this.state[appt.state].push(appt);
                }
            }
        } catch (error) {
            console.error("Failed to load appointments:", error);
        }
    }
}

ClinicKanban.template = "clinic_management.ClinicKanban";
registry.category("actions").add("clinic_kanban", ClinicKanban);