
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';



import {  Plus, FileCode, Settings,  ChevronDown, Bell, CreditCard, LogOut, Zap} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileIcon } from './FileIcon';
import { useAuth } from '../lib/auth';



const AppSidebar = ({ 
  files, 
  activeFile, 
  onFileClick, 
  isCreatingFile, 
  setIsCreatingFile,
  newFileName,
  setNewFileName,
  handleCreateFile,
  user,
  theme,
  onThemeChange,
  connectedUsers
}) => {

  const {signout} = useAuth();
  return (
    <Sidebar className="border-r border-[#3E3F3E]">
      
      <SidebarContent className="bg-[#171717]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#3E3F3E] text-xs font-semibold uppercase">Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setIsCreatingFile(true)}
                  className="hover:bg-[#898888] text-[#D0D0D0] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>New File</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isCreatingFile && (
                <SidebarMenuItem className="mt-2">
                  
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                      onBlur={() => newFileName ? handleCreateFile() : setIsCreatingFile(false)}
                      placeholder="filename.ext"
                      className="w-full rounded-md border  bg-[#171717] px-3 py-2 text-sm text-[#D0D0D0] placeholder:text-[#3E3F3E] focus:outline-none"
                      autoFocus
                    />
                  
                </SidebarMenuItem>
              )}

              {files.map(file => (
                <SidebarMenuItem key={file.id}>
                  <SidebarMenuButton 
                    onClick={() => onFileClick(file)}
                    isActive={activeFile?.id === file.id}
                    className="hover:bg-[#212121] text-[#D0D0D0] data-[active=true]:bg-[#212121] data-[active=true]:text-amber-500"
                  >
                    <FileIcon language={file.language} size="small" />
                    <span>{file.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#3E3F3E] bg-[#171717]">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 hover:bg-[#212121] data-[state=open]:bg-[#212121] group">
                  <Avatar className="h-8 w-8 border-2 border-[#3E3F3E]">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white font-semibold text-sm">
                      {user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none flex-1 text-left">
                    <span className="font-medium text-sm text-[#D0D0D0] group-hover:text-[#FFFFFF] transition-colors">{user.username}</span>
                    <span className="text-xs text-[#3E3F3E]">{user.email}</span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-[#3E3F3E]" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="right" 
                align="end"
                className="w-72 bg-[#171717] border-[#3E3F3E] text-[#D0D0D0]"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3 py-2">
                    <Avatar className="h-12 w-12 border-2 border-[#3E3F3E]">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white font-semibold">
                        {user.username}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-[#D0D0D0]">{user.username}</span>
                      <span className="text-xs text-[#3E3F3E]">{user.email}</span>
                      <span className="text-xs text-amber-500 font-medium">Free Plan</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-[#3E3F3E]" />
                
                <DropdownMenuItem className="gap-3 py-3 focus:bg-[#212121] focus:text-amber-500 cursor-pointer">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Buy me a coffee.</span>
                    <span className="text-xs text-[#3E3F3E]">Unlock all features</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-[#3E3F3E]" />
                
                <DropdownMenuItem className="gap-3 focus:bg-[#212121] focus:text-[#D0D0D0] cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="gap-3 focus:bg-[#212121] focus:text-[#D0D0D0] cursor-pointer">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="gap-3 focus:bg-[#212121] focus:text-[#D0D0D0] cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-[#3E3F3E]" />
                
                <DropdownMenuItem onClick={signout} className="gap-3 focus:bg-red-950 focus:text-red-400 cursor-pointer text-red-400">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export {AppSidebar}