export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamp = string; // Supabase returns ISO strings

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      organizations: TableDef<
        {
          id: string;
          name: string;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          name: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          name?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      organization_members: TableDef<
        {
          id: string;
          org_id: string;
          user_id: string;
          is_primary: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          user_id: string;
          is_primary?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          user_id?: string;
          is_primary?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      departments: TableDef<
        {
          id: string;
          org_id: string;
          name: string;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          name: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          name?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      designations: TableDef<
        {
          id: string;
          org_id: string;
          department_id: string | null;
          title: string;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          department_id?: string | null;
          title: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          department_id?: string | null;
          title?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      employees: TableDef<
        {
          id: string;
          org_id: string;
          user_id: string | null;
          employee_code: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          dob: string | null;
          gender: string | null;
          marital_status: string | null;
          department_id: string | null;
          designation_id: string | null;
          manager_id: string | null;
          employment_type: string | null;
          joining_date: string | null;
          confirmation_date: string | null;
          employment_status: string;
          work_location: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          user_id?: string | null;
          employee_code: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          dob?: string | null;
          gender?: string | null;
          marital_status?: string | null;
          department_id?: string | null;
          designation_id?: string | null;
          manager_id?: string | null;
          employment_type?: string | null;
          joining_date?: string | null;
          confirmation_date?: string | null;
          employment_status?: string;
          work_location?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          user_id?: string | null;
          employee_code?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          dob?: string | null;
          gender?: string | null;
          marital_status?: string | null;
          department_id?: string | null;
          designation_id?: string | null;
          manager_id?: string | null;
          employment_type?: string | null;
          joining_date?: string | null;
          confirmation_date?: string | null;
          employment_status?: string;
          work_location?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      compensation: TableDef<
        {
          id: string;
          org_id: string;
          employee_id: string;
          base_salary: number;
          bonus: number;
          bank_account: string | null;
          ifsc_code: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          employee_id: string;
          base_salary?: number;
          bonus?: number;
          bank_account?: string | null;
          ifsc_code?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          employee_id?: string;
          base_salary?: number;
          bonus?: number;
          bank_account?: string | null;
          ifsc_code?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      employee_documents: TableDef<
        {
          id: string;
          org_id: string;
          employee_id: string;
          file_path: string;
          document_type: string;
          uploaded_by: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          employee_id: string;
          file_path: string;
          document_type: string;
          uploaded_by?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          employee_id?: string;
          file_path?: string;
          document_type?: string;
          uploaded_by?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      roles: TableDef<
        {
          id: string;
          org_id: string;
          name: string;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          name: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          name?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      permissions: TableDef<
        {
          id: string;
          key: string;
          created_at: Timestamp;
        },
        {
          id?: string;
          key: string;
          created_at?: Timestamp;
        },
        {
          id?: string;
          key?: string;
          created_at?: Timestamp;
        }
      >;
      role_permissions: TableDef<
        {
          role_id: string;
          permission_id: string;
          created_at: Timestamp;
        },
        {
          role_id: string;
          permission_id: string;
          created_at?: Timestamp;
        },
        {
          role_id?: string;
          permission_id?: string;
          created_at?: Timestamp;
        }
      >;
      user_roles: TableDef<
        {
          id: string;
          org_id: string;
          user_id: string;
          role_id: string;
          created_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          user_id: string;
          role_id: string;
          created_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          user_id?: string;
          role_id?: string;
          created_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      leave_types: TableDef<
        {
          id: string;
          org_id: string;
          name: string;
          annual_quota: number;
          is_accrual_based: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          name: string;
          annual_quota?: number;
          is_accrual_based?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          name?: string;
          annual_quota?: number;
          is_accrual_based?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      leave_balances: TableDef<
        {
          id: string;
          org_id: string;
          employee_id: string;
          leave_type_id: string;
          balance: number;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          employee_id: string;
          leave_type_id: string;
          balance?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          employee_id?: string;
          leave_type_id?: string;
          balance?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      leave_requests: TableDef<
        {
          id: string;
          org_id: string;
          employee_id: string;
          leave_type_id: string;
          start_date: string;
          end_date: string;
          reason: string | null;
          status: string;
          approved_by: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          employee_id: string;
          leave_type_id: string;
          start_date: string;
          end_date: string;
          reason?: string | null;
          status?: string;
          approved_by?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          employee_id?: string;
          leave_type_id?: string;
          start_date?: string;
          end_date?: string;
          reason?: string | null;
          status?: string;
          approved_by?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      holidays: TableDef<
        {
          id: string;
          org_id: string;
          name: string;
          date: string;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          name: string;
          date: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          name?: string;
          date?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      onboarding_templates: TableDef<
        {
          id: string;
          org_id: string;
          name: string;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          name: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          name?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      onboarding_template_items: TableDef<
        {
          id: string;
          org_id: string;
          template_id: string;
          task_title: string;
          default_due_days: number;
          sort_order: number;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          template_id: string;
          task_title: string;
          default_due_days?: number;
          sort_order?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          template_id?: string;
          task_title?: string;
          default_due_days?: number;
          sort_order?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      onboarding_tasks: TableDef<
        {
          id: string;
          org_id: string;
          employee_id: string;
          assigned_to: string | null;
          task_title: string;
          status: string;
          due_date: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          employee_id: string;
          assigned_to?: string | null;
          task_title: string;
          status?: string;
          due_date?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          employee_id?: string;
          assigned_to?: string | null;
          task_title?: string;
          status?: string;
          due_date?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      offboarding_tasks: TableDef<
        {
          id: string;
          org_id: string;
          employee_id: string;
          assigned_to: string | null;
          task_title: string;
          status: string;
          created_at: Timestamp;
          updated_at: Timestamp;
          deleted_at: Timestamp | null;
        },
        {
          id?: string;
          org_id: string;
          employee_id: string;
          assigned_to?: string | null;
          task_title: string;
          status?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        },
        {
          id?: string;
          org_id?: string;
          employee_id?: string;
          assigned_to?: string | null;
          task_title?: string;
          status?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          deleted_at?: Timestamp | null;
        }
      >;
      audit_logs: TableDef<
        {
          id: string;
          org_id: string;
          user_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          timestamp: Timestamp;
        },
        {
          id?: string;
          org_id: string;
          user_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          timestamp?: Timestamp;
        },
        {
          id?: string;
          org_id?: string;
          user_id?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          timestamp?: Timestamp;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      has_permission: {
        Args: { p_permission_key: string; p_org_id?: string | null };
        Returns: boolean;
      };
      has_role: {
        Args: { p_role_name: string; p_org_id?: string | null };
        Returns: boolean;
      };
      bootstrap_current_user_org: {
        Args: { p_org_name: string };
        Returns: string;
      };
      report_headcount_by_department: {
        Args: Record<string, never>;
        Returns: { department_name: string; headcount: number }[];
      };
      report_active_vs_inactive: {
        Args: Record<string, never>;
        Returns: { active_count: number; inactive_count: number }[];
      };
      process_leave_request: {
        Args: { p_request_id: string; p_new_status: string };
        Returns: void;
      };
      calculate_leave_days: {
        Args: { p_org_id: string; p_start: string; p_end: string };
        Returns: number;
      };
      create_onboarding_tasks_from_template: {
        Args: { p_employee_id: string; p_template_id: string; p_assigned_to: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

