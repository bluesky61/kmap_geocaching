<!-- login -->
<div class="modal fade" id="loginModal" role="dialog">
    <div class="modal-dialog modal-sm">

        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header" style="padding:35px 50px;">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4><span class="glyphicon glyphicon-lock"></span>Login</h4>
            </div>
            <div class="modal-body" style="padding:40px 50px;">
                <form role="form">
                  <div class="form-group">
                    <label for="usrname"><span class="glyphicon glyphicon-user"></span> 사용자명</label>
                    <input type="text" class="form-control" id="userid2" placeholder="Enter user-id" 
                           value="<?php if(isset($_COOKIE['userid'])) echo $_COOKIE['userid']; ?>" autofocus>
                  </div>
                  <div class="form-group">
                    <label for="psw"><span class="glyphicon glyphicon-eye-open"></span> 비밀번호</label>
                    <input type="password" class="form-control" id="pwd2" placeholder="Enter password"
                           value="<?php if(isset($_COOKIE['passwd'])) echo $_COOKIE['passwd']; ?>">
                  </div>
                    <button type="submit" class="btn btn-success btn-block" id="login2"><span class="glyphicon glyphicon-off"></span>Login</button>
                </form>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-danger btn-default pull-left" data-dismiss="modal"><span class="glyphicon glyphicon-remove"></span> Cancel</button>
                <p>Not a member? <a href="#">Sign Up</a></p>
                <p>Forgot <a href="#">Password?</a></p>
            </div>
        </div>
    </div>
</div> 

<!-- Help -->
<div class="modal fade" id="myHelp" role="dialog">
    <div class="modal-dialog modal-md">
        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">도움말</h4>
            </div>
            <div class="modal-body">
                <h4>목적</h4>
                <p>이 사이트는 지오캐싱을 쉽고 편하게 즐기게 하는 목적으로 만들어졌습니다.</p>
                <p>우리나라에서는 구글맵이 그다지 좋지 않습니다. 특히 등산로 정보나 등고선이 없어서, 
                   산에 있는 지오캐시를 찾으러 갈 때에는 여러가지로 불편합니다. 이 사이트는 우리나라에 
                   있는 지오캐시를 다음지도와 네이버 지도위에 표시하여 캐시의 위치를 쉽게 찾아볼 수 있도록 하였습니다.</p>
                <h4>사용방법</h4>
                <p>로그인만 하면 전국의 모든 캐시가 지도상에 표시됩니다. 아이디가 없을 분은 회원가입을 하시면 
                   사용할 수 있습니다. 회원가입할 때 geocaching.com 에서 사용하는 아이디를 정확하게 
                   입력해주셔야 자신의 캐시의 상태를 쉽게 알 수 있습니다.</p>
                <p>원래 이 사이트는 데스크탑용으로 개발하였습니다. 스마트폰에서도 사용하실 수는 있지만,
                   전국 데이터를 한꺼번에 올리므로 성능이 많이 떨어집니다. 참고하시고 사용하세요.</p>
                <h4>주의사항</h4>
                <p>메뉴에는 나와 있어도 지원되지 않는 내용이 있습니다. 언제가 될지는 모르지만, 
                   그래도 언젠가는 추가하려고 노력하고 있음을 알려드립니다. :)</p>
                <p>지도에 표시되는 지오캐시는 최신 데이터가 아닙니다. 개발자가 주기적으로
                    업로드해 주고 있습니다.</p>
                <p>기타 오류를 신고할 게 있으시거나 요청할 게 있으시면 
                    <a href="https://www.geocaching.com/profile/?u=bluesky61">개발자의 회원정보</a>에
                    들어가셔서 메시지센터로 연락을 주시기 바랍니다.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
         </div>

    </div>
</div>

<!-- Wait
<div class="modal fade" id="wdialog" role="dialog">
    <div class="modal-dialog modal-md">
        <!-- Modal content
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">Wait</h4>
            </div>
            <div class="modal-body">
                <p>잠시 기다려 주세요. 처리중입니다.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
         </div>

    </div>
</div>
 -->