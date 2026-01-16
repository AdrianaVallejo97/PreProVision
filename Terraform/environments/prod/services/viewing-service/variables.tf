variable "service_port" { 
    type = number, default = 10000 
    }
variable "metrics_port" { 
    type = number, 
    default = 9100 
    }

variable "enable_redis_access"  { 
    type = bool, 
    default = true 
    }
variable "enable_mysql_access"  { 
    type = bool, 
    default = false 
    }
variable "enable_mongodb_access" { 
    type = bool, 
    default = false 
    }
