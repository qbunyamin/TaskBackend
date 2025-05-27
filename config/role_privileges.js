module.exports = {
    privGroups: [
        {
            id: "USERS",
            name: "User Permissions"
        },
        {
            id: "ROLES",
            name: "Role Permissions"
        },
        {
            id: "PROJECTS",
            name: "Projects Permissions"
        },
        {
            id: "TOPICS",
            name: "Topics Permissions"
        },
        {
            id: "TYPES",
            name: "Types Permissions"
        },
        {
            id: "CATEGORIES",
            name: "Category Permissions"
        },
        {
            id: "AUDITLOGS",
            name: "AuditLogs Permissions"
        },
        {
            id: "REMARK",
            name: "Remark Permissions"
        }
    ],

    privileges: [
        {
            key: "user_view",
            name: "User View",
            group: "USERS",
            description: "User view"
        },
        {
            key: "user_add",
            name: "User Add",
            group: "USERS",
            description: "User add"
        },
        {
            key: "user_update",
            name: "User Update",
            group: "USERS",
            description: "User update"
        },
        {
            key: "user_delete",
            name: "User Delete",
            group: "USERS",
            description: "User delete"
        },
        {
            key: "project_view",
            name: "Project View",
            group: "PROJECTS",
            description: "Project view"
        },
        {
            key: "project_add",
            name: "Project Add",
            group: "PROJECTS",
            description: "Project add"
        },
        {
            key: "project_update",
            name: "Project Update",
            group: "PROJECTS",
            description: "Project update"
        },
        {
            key: "project_delete",
            name: "Project Delete",
            group: "PROJECTS",
            description: "Project delete"
        },
        {
            key: "remark_view",
            name: "Remark View",
            group: "REMARK",
            description: "Remark view"
        },
        {
            key: "remark_add",
            name: "Remark Add",
            group: "REMARK",
            description: "Remark add"
        },
        {
            key: "remark_update",
            name: "Remark Update",
            group: "REMARK",
            description: "Remark update"
        },
        {
            key: "remark_delete",
            name: "Remark Delete",
            group: "REMARK",
            description: "Remark delete"
        },
        {
            key: "type_view",
            name: "Type View",
            group: "TYPES",
            description: "Type view"
        },
        {
            key: "type_add",
            name: "Type Add",
            group: "TYPES",
            description: "Type add"
        },
        {
            key: "type_update",
            name: "Type Update",
            group: "TYPES",
            description: "Type update"
        },
        {
            key: "type_delete",
            name: "Type Delete",
            group: "TYPES",
            description: "Type delete"
        },
        {
            key: "topic_view",
            name: "Topic View",
            group: "TOPICS",
            description: "Topic view"
        },
        {
            key: "topic_add",
            name: "Topic Add",
            group: "TOPICS",
            description: "Topic add"
        },
        {
            key: "topic_update",
            name: "Topic Update",
            group: "TOPICS",
            description: "Topic update"
        },
        {
            key: "topic_delete",
            name: "Topic Delete",
            group: "TOPICS",
            description: "Topic delete"
        },
        {
            key: "role_view",
            name: "Role View",
            group: "ROLES",
            description: "Role view"
        },
        {
            key: "role_add",
            name: "Role Add",
            group: "ROLES",
            description: "Role add"
        },
        {
            key: "role_update",
            name: "Role Update",
            group: "ROLES",
            description: "Role update"
        },
        {
            key: "role_delete",
            name: "Role Delete",
            group: "ROLES",
            description: "Role delete"
        },
        {
            key: "category_view",
            name: "Category View",
            group: "CATEGORIES",
            description: "Category view"
        },
        {
            key: "category_add",
            name: "Category Add",
            group: "CATEGORIES",
            description: "Category add"
        },
        {
            key: "category_update",
            name: "Category Update",
            group: "CATEGORIES",
            description: "Category update"
        },
        {
            key: "category_delete",
            name: "Category Delete",
            group: "CATEGORIES",
            description: "Category delete"
        },
        {
            key: "auditlogs_view",
            name: "AuditLogs View",
            group: "AUDITLOGS",
            description: "AuditLogs View"
        }
    ],

    roles: {
        admin: [
            "user_view", "user_add", "user_update", "user_delete",
            "project_view", "project_add", "project_update", "project_delete",
            "remark_view", "remark_add", "remark_update", "remark_delete",
            "type_view", "type_add", "type_update", "type_delete",
            "topic_view", "topic_add", "topic_update", "topic_delete",
            "role_view", "role_add", "role_update", "role_delete",
            "category_view", "category_add", "category_update", "category_delete",
            "auditlogs_view"
        ],
        super_admin: [
            "user_view", "user_add", "user_update", "user_delete",
            "project_view", "project_add", "project_update", "project_delete",
            "remark_view", "remark_add", "remark_update", "remark_delete",
            "type_view", "type_add", "type_update", "type_delete",
            "topic_view", "topic_add", "topic_update", "topic_delete",
            "role_view", "role_add", "role_update", "role_delete",
            "category_view", "category_add", "category_update", "category_delete",
            "auditlogs_view"
        ],
        user: [
            "project_view"
        ],
        project_manager: [
            "project_view", "project_add", "project_update", "project_delete"
        ],
        manager: [
            "user_view", "user_update",
            "project_view"
        ]
    }
};
