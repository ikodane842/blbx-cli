Prompt = {}

Prompt.current_path = "/root"
Prompt.ip_address = "local"
Prompt.lan_address = "host"
Prompt.username = "blbx"

Prompt.get_lan_address = function()
    return self.lan_address
end function 

Prompt.set_lan_address = function(new_lan_address)
    self.lan_address = new_lan_address
    return self.lan_address
end function 

Prompt.get_username = function()
    return self.username 
end function 

Prompt.set_username = function(new_username)
    self.username = new_username 
    return self.username 
end function 

Prompt.get_ip_address = function()
    return self.ip_address
end function 

Prompt.get_current_path = function()
    return self.current_path
end function 


Prompt.set_current_path = function(new_path)
    self.current_path = new_path
end function

Prompt.set_ip_address = function(new_ip_address)
    self.ip_address = new_ip_address
end function 

Prompt.message = function()
    return box(self.get_current_path()) + wisp + box(Prompt.get_username()) + wisp + box(self.get_ip_address()) + wisp + box(self.get_lan_address()) + char(10) + wisp + box("#") + "<b></u>" + ":> ".c
end function

Prompt.get_message = function()
    return self.message()
end function 
